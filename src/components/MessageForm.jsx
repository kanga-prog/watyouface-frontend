import React, { useState } from "react";

export default function MessageForm({ onSend }) {
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={submit} className="flex border-t p-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Écrire un message..."
        className="flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
      />
      <button
        type="submit"
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Envoyer
      </button>
    </form>
  );
}
