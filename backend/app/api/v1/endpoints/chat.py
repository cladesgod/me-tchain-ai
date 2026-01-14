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
    object_id: Optional[str] = None,
    object_title: Optional[str] = None,
) -> None:
    """
    WebSocket endpoint for real-time chat with multi-persona or object persona support.

    Query Parameters:
    - session_id: Optional session identifier
    - object_id: If provided, chat with a specific Career Game object (e.g., 'project_apa_citation')
    - object_title: Display title for the object (used in fallback responses)

    Message format (multi-persona mode - default):
    - Incoming: {"content": "user message", "persona": "engineer" (optional)}
    - Outgoing: {"type": "typing", "persona": "engineer", "content": ""}
    - Outgoing: {"type": "stream", "persona": "engineer", "content": "partial response"}
    - Outgoing: {"type": "done", "persona": "engineer", "content": ""}

    Message format (object persona mode - when object_id provided):
    - Incoming: {"content": "user message"}
    - Outgoing: {"type": "typing", "object_id": "project_apa_citation", "content": ""}
    - Outgoing: {"type": "stream", "object_id": "project_apa_citation", "content": "partial response"}
    - Outgoing: {"type": "done", "object_id": "project_apa_citation", "content": ""}

    Error format:
    - Outgoing: {"type": "error", "content": "error message"}
    """
    # Determine chat mode
    is_object_mode = object_id is not None
    # Generate session ID if not provided
    if not session_id:
        import uuid
        session_id = str(uuid.uuid4())

    await manager.connect(websocket, session_id)

    # Initialize chat agent and memory for this session
    memory = ConversationMemory()
    agent = ChatAgent(memory=memory)

    try:
        # Send appropriate welcome message based on mode
        if is_object_mode:
            display_title = object_title or object_id
            await manager.send_message(
                session_id,
                {
                    "type": "system",
                    "content": f"You're now chatting with {display_title}!",
                    "session_id": session_id,
                    "object_id": object_id,
                },
            )
            logger.info(
                "object_chat_started",
                session_id=session_id,
                object_id=object_id,
                object_title=object_title,
            )
        else:
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

                if is_object_mode:
                    # Object persona mode
                    logger.info(
                        "object_chat_message_received",
                        session_id=session_id,
                        object_id=object_id,
                        content_length=len(user_content),
                    )

                    # Stream object persona response
                    async for response_chunk in agent.stream_object_response(
                        user_content,
                        session_id,
                        object_id,
                        object_title or object_id,
                    ):
                        # response_chunk format: {"type": "typing"|"stream"|"done", "object_id": str, "content": str}
                        await manager.send_message(session_id, response_chunk)
                else:
                    # Multi-persona mode (default)
                    selected_persona = message.get("persona", None)

                    logger.info(
                        "chat_message_received",
                        session_id=session_id,
                        content_length=len(user_content),
                        selected_persona=selected_persona,
                    )

                    # Stream multi-persona response from agent
                    async for response_chunk in agent.stream_multi_persona_response(
                        user_content, session_id, selected_persona
                    ):
                        # response_chunk format: {"type": "typing"|"stream"|"done", "persona": str, "content": str}
                        await manager.send_message(session_id, response_chunk)

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
        logger.info("client_disconnected", session_id=session_id, mode="object" if is_object_mode else "multi_persona")
    except Exception as e:
        logger.error("websocket_error", session_id=session_id, error=str(e), mode="object" if is_object_mode else "multi_persona")
        await manager.send_message(
            session_id,
            {
                "type": "error",
                "content": "An error occurred. Please try again.",
            },
        )
        manager.disconnect(session_id)
