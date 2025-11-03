import React from "react";

export default function ChatList({ conversations, onSelect }) {
  return (
    <div className="chat-list">
      {conversations.map(c => (
        <div key={c.id} onClick={() => onSelect(c.id)}>
          {c.title || c.id}
        </div>
      ))}
    </div>
  );
}
