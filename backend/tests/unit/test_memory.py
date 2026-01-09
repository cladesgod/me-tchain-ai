"""Tests for conversation memory."""

import pytest

from app.services.chatbot.memory import ConversationMemory


class TestConversationMemory:
    """Test ConversationMemory class."""

    def test_create_new_conversation(self):
        """Test creating a new conversation."""
        memory = ConversationMemory()
        conversation = memory.get_or_create("test-session")

        assert conversation.session_id == "test-session"
        assert len(conversation.messages) == 0

    def test_add_message(self):
        """Test adding messages to conversation."""
        memory = ConversationMemory()
        memory.add_message("test-session", "user", "Hello")
        memory.add_message("test-session", "assistant", "Hi there!")

        history = memory.get_history("test-session")

        assert len(history) == 2
        assert history[0]["role"] == "user"
        assert history[0]["content"] == "Hello"
        assert history[1]["role"] == "assistant"

    def test_max_history_limit(self):
        """Test that history is trimmed to max limit."""
        memory = ConversationMemory(max_history=3)

        for i in range(5):
            memory.add_message("test-session", "user", f"Message {i}")

        history = memory.get_history("test-session")

        assert len(history) == 3
        assert history[0]["content"] == "Message 2"

    def test_clear_conversation(self):
        """Test clearing a conversation."""
        memory = ConversationMemory()
        memory.add_message("test-session", "user", "Hello")
        memory.clear("test-session")

        history = memory.get_history("test-session")
        assert len(history) == 0

    def test_delete_conversation(self):
        """Test deleting a conversation entirely."""
        memory = ConversationMemory()
        memory.add_message("test-session", "user", "Hello")
        memory.delete("test-session")

        # Should create new empty conversation
        history = memory.get_history("test-session")
        assert len(history) == 0
