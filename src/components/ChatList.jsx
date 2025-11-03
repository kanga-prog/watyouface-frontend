// src/components/ChatList.jsx
import React from "react";

export default function ChatList({ conversations, selectedConvId, onSelect }) {
  return (
    <div className="chat-list border-r p-2 w-64">
      <h3 className="font-bold mb-2">Conversations</h3>
      {conversations.length === 0 ? (
        <p className="text-gray-500">Aucune conversation</p>
      ) : (
        conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`p-2 cursor-pointer rounded ${
              conv.id === selectedConvId ? "bg-blue-200" : "hover:bg-gray-100"
            }`}
          >
            {conv.name || `Conversation ${conv.id}`}
          </div>
        ))
      )}
    </div>
  );
}
