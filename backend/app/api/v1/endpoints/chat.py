"""
Chat WebSocket Endpoint

Real-time chat with AI chatbot via WebSocket.
"""

import json
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.logging import get_logger
from app.services.chatbot.agent import ChatAgent
from app.services.chatbot.memory import ConversationMemory

router = APIRouter()
logger = get_logger(__name__)


class ConnectionManager:
    """Manage WebSocket connections."""

    def __init__(self) -> None:
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str) -> None:
        """Accept and store a WebSocket connection."""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info("websocket_connected", session_id=session_id)

    def disconnect(self, session_id: str) -> None:
        """Remove a WebSocket connection."""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info("websocket_disconnected", session_id=session_id)

    async def send_message(self, session_id: str, message: dict) -> None:
        """Send a message to a specific connection."""
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)


manager = ConnectionManager()


@router.websocket("")
async def websocket_chat(
    websocket: WebSocket,
    session_id: Optional[str] = None,
) -> None:
    """
    WebSocket endpoint for real-time chat.

    Message format:
    - Incoming: {"type": "message", "content": "user message"}
    - Outgoing: {"type": "response", "content": "bot response"}
    - Outgoing: {"type": "stream", "content": "partial response", "done": false}
    - Outgoing: {"type": "error", "content": "error message"}
    """
    # Generate session ID if not provided
    if not session_id:
        import uuid
        session_id = str(uuid.uuid4())

    await manager.connect(websocket, session_id)

    # Initialize chat agent and memory for this session
    memory = ConversationMemory()
    agent = ChatAgent(memory=memory)

    try:
        # Send welcome message
        await manager.send_message(
            session_id,
            {
                "type": "system",
                "content": "Hello! I'm Timucin's AI assistant. How can I help you today?",
                "session_id": session_id,
            },
        )

        while True:
            # Receive message from client
            data = await websocket.receive_text()

            try:
                message = json.loads(data)
                user_content = message.get("content", "")

                if not user_content:
                    continue

                logger.info(
                    "chat_message_received",
                    session_id=session_id,
                    content_length=len(user_content),
                )

                # Stream response from agent
                async for chunk in agent.stream_response(user_content, session_id):
                    await manager.send_message(
                        session_id,
                        {
                            "type": "stream",
                            "content": chunk,
                            "done": False,
                        },
                    )

                # Send completion signal
                await manager.send_message(
                    session_id,
                    {
                        "type": "stream",
                        "content": "",
                        "done": True,
                    },
                )

            except json.JSONDecodeError:
                await manager.send_message(
                    session_id,
                    {
                        "type": "error",
                        "content": "Invalid message format",
                    },
                )

    except WebSocketDisconnect:
        manager.disconnect(session_id)
        logger.info("client_disconnected", session_id=session_id)
    except Exception as e:
        logger.error("websocket_error", session_id=session_id, error=str(e))
        await manager.send_message(
            session_id,
            {
                "type": "error",
                "content": "An error occurred. Please try again.",
            },
        )
        manager.disconnect(session_id)
