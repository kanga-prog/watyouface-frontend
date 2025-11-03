import React, { useState } from "react";

export default function MessageForm({ onSend }) {
  const [text, setText] = useState("");
  const submit = e => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };
  return (
    <form onSubmit={submit}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Message..." />
      <button>Send</button>
    </form>
  );
}
