import React, { useState } from "react";

export default function MessageForm({ onSend }) {
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text); // message inchangé
    setText("");
  };

  return (
    <form onSubmit={submit} className="flex items-center mt-2">
      <label className="sr-only" htmlFor="message-content">Message</label>
      <input
        id="message-content"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Écrire un message..."
        className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
      >
        Envoyer
      </button>
    </form>
  );
}
