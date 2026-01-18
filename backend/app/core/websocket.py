"""
Enhanced WebSocket Connection Manager

Features:
- Connection health monitoring with ping/pong
- TTL-based connection cleanup
- Connection limits per client
- Automatic stale connection removal
"""

import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional

from fastapi import WebSocket

from app.core.logging import get_logger

logger = get_logger(__name__)

# Configuration
MAX_CONNECTIONS_PER_CLIENT = 5  # Max concurrent connections per session
MAX_TOTAL_CONNECTIONS = 1000  # Total connection limit
CONNECTION_TTL_SECONDS = 3600  # 1 hour idle timeout
HEARTBEAT_INTERVAL_SECONDS = 30  # Ping interval
HEARTBEAT_TIMEOUT_SECONDS = 10  # Pong timeout


@dataclass
class ConnectionInfo:
    """Information about a WebSocket connection."""

    websocket: WebSocket
    session_id: str
    connected_at: datetime = field(default_factory=datetime.utcnow)
    last_activity: datetime = field(default_factory=datetime.utcnow)
    is_alive: bool = True
    heartbeat_task: Optional[asyncio.Task] = None


class ConnectionManager:
    """
    Manage WebSocket connections with health monitoring and cleanup.

    Features:
    - Per-client connection limits
    - Automatic cleanup of stale connections
    - Health monitoring with ping/pong
    - TTL-based connection expiry
    """

    def __init__(self) -> None:
        # Map: session_id -> ConnectionInfo
        self.active_connections: dict[str, ConnectionInfo] = {}
        # Background cleanup task
        self._cleanup_task: Optional[asyncio.Task] = None
        self._is_running = False

    async def start(self) -> None:
        """Start the connection manager background tasks."""
        if self._is_running:
            return

        self._is_running = True
        self._cleanup_task = asyncio.create_task(self._periodic_cleanup())
        logger.info("connection_manager_started")

    async def stop(self) -> None:
        """Stop the connection manager and cleanup all connections."""
        self._is_running = False

        # Cancel cleanup task
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass

        # Close all connections
        for session_id in list(self.active_connections.keys()):
            await self._close_connection(session_id, code=1001, reason="Server shutting down")

        logger.info("connection_manager_stopped")

    async def connect(self, websocket: WebSocket, session_id: str) -> bool:
        """
        Accept and store a WebSocket connection.

        Returns:
            bool: True if connection was accepted, False if rejected (limits exceeded)
        """
        # Check total connection limit
        if len(self.active_connections) >= MAX_TOTAL_CONNECTIONS:
            logger.warning(
                "connection_limit_exceeded",
                session_id=session_id,
                total_connections=len(self.active_connections),
                max_allowed=MAX_TOTAL_CONNECTIONS,
            )
            await websocket.close(code=1008, reason="Server at capacity")
            return False

        # Check per-client connection limit
        existing_connections = sum(
            1 for conn in self.active_connections.values() if conn.session_id == session_id
        )
        if existing_connections >= MAX_CONNECTIONS_PER_CLIENT:
            logger.warning(
                "client_connection_limit_exceeded",
                session_id=session_id,
                client_connections=existing_connections,
                max_allowed=MAX_CONNECTIONS_PER_CLIENT,
            )
            await websocket.close(code=1008, reason="Too many connections from this client")
            return False

        # Accept the connection
        await websocket.accept()

        # Create connection info
        conn_info = ConnectionInfo(websocket=websocket, session_id=session_id)

        # Start heartbeat task
        conn_info.heartbeat_task = asyncio.create_task(
            self._heartbeat_loop(session_id, conn_info)
        )

        # Store connection
        self.active_connections[session_id] = conn_info

        logger.info(
            "websocket_connected",
            session_id=session_id,
            total_connections=len(self.active_connections),
        )

        return True

    async def disconnect(self, session_id: str) -> None:
        """Remove and cleanup a WebSocket connection."""
        await self._close_connection(session_id)

    async def send_message(self, session_id: str, message: dict) -> bool:
        """
        Send a message to a specific connection.

        Returns:
            bool: True if message was sent successfully, False otherwise
        """
        conn_info = self.active_connections.get(session_id)
        if not conn_info:
            return False

        try:
            await conn_info.websocket.send_json(message)
            # Update last activity time
            conn_info.last_activity = datetime.utcnow()
            return True
        except Exception as e:
            logger.error("send_message_failed", session_id=session_id, error=str(e))
            # Connection is broken, clean it up
            await self._close_connection(session_id)
            return False

    def get_connection_count(self) -> int:
        """Get the number of active connections."""
        return len(self.active_connections)

    def is_connected(self, session_id: str) -> bool:
        """Check if a session is connected."""
        return session_id in self.active_connections

    async def _heartbeat_loop(self, session_id: str, conn_info: ConnectionInfo) -> None:
        """
        Send periodic pings to keep connection alive and detect dead connections.

        This task runs for each connection and sends pings at regular intervals.
        If a pong is not received within the timeout, the connection is closed.
        """
        try:
            while self._is_running and conn_info.is_alive:
                await asyncio.sleep(HEARTBEAT_INTERVAL_SECONDS)

                # Check if connection still exists
                if session_id not in self.active_connections:
                    break

                try:
                    # Send ping and wait for pong with timeout
                    await asyncio.wait_for(
                        conn_info.websocket.send_json({"type": "ping"}),
                        timeout=HEARTBEAT_TIMEOUT_SECONDS,
                    )
                    conn_info.last_activity = datetime.utcnow()
                except asyncio.TimeoutError:
                    logger.warning(
                        "heartbeat_timeout",
                        session_id=session_id,
                        timeout_seconds=HEARTBEAT_TIMEOUT_SECONDS,
                    )
                    conn_info.is_alive = False
                    await self._close_connection(session_id, code=1002, reason="Heartbeat timeout")
                    break
                except Exception as e:
                    logger.error("heartbeat_error", session_id=session_id, error=str(e))
                    await self._close_connection(session_id)
                    break

        except asyncio.CancelledError:
            # Task was cancelled during shutdown
            pass
        except Exception as e:
            logger.error("heartbeat_loop_error", session_id=session_id, error=str(e))

    async def _periodic_cleanup(self) -> None:
        """
        Periodically cleanup stale connections based on TTL.

        This background task runs every minute and removes connections that:
        - Haven't had activity in CONNECTION_TTL_SECONDS
        - Are marked as not alive
        """
        try:
            while self._is_running:
                await asyncio.sleep(60)  # Run cleanup every minute

                current_time = datetime.utcnow()
                stale_sessions = []

                for session_id, conn_info in self.active_connections.items():
                    # Check TTL
                    idle_time = current_time - conn_info.last_activity
                    if idle_time > timedelta(seconds=CONNECTION_TTL_SECONDS):
                        logger.info(
                            "connection_ttl_expired",
                            session_id=session_id,
                            idle_seconds=idle_time.total_seconds(),
                        )
                        stale_sessions.append(session_id)
                    # Check if marked as dead
                    elif not conn_info.is_alive:
                        logger.info("connection_dead", session_id=session_id)
                        stale_sessions.append(session_id)

                # Cleanup stale connections
                for session_id in stale_sessions:
                    await self._close_connection(
                        session_id, code=1000, reason="Connection idle timeout"
                    )

                if stale_sessions:
                    logger.info(
                        "cleanup_completed",
                        removed_count=len(stale_sessions),
                        remaining_connections=len(self.active_connections),
                    )

        except asyncio.CancelledError:
            # Task was cancelled during shutdown
            pass
        except Exception as e:
            logger.error("cleanup_task_error", error=str(e))

    async def _close_connection(
        self, session_id: str, code: int = 1000, reason: str = "Connection closed"
    ) -> None:
        """
        Internal method to close and cleanup a connection.

        Args:
            session_id: The session to close
            code: WebSocket close code
            reason: Close reason message
        """
        conn_info = self.active_connections.get(session_id)
        if not conn_info:
            return

        # Cancel heartbeat task
        if conn_info.heartbeat_task:
            conn_info.heartbeat_task.cancel()
            try:
                await conn_info.heartbeat_task
            except asyncio.CancelledError:
                pass

        # Close WebSocket
        try:
            await conn_info.websocket.close(code=code, reason=reason)
        except Exception as e:
            logger.debug("close_websocket_error", session_id=session_id, error=str(e))

        # Remove from active connections
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(
                "websocket_disconnected",
                session_id=session_id,
                total_connections=len(self.active_connections),
            )
