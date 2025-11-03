// src/components/MessageForm.jsx
import React, { useState } from "react";
import { sendMessage } from "../utils/chatApi";

export default function MessageForm({ convId }) {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage(convId, { content: text });
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex mt-2">
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        className="flex-1 border p-2 rounded-l"
        placeholder="Écrire un message..."
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">
        Envoyer
      </button>
    </form>
  );
}
