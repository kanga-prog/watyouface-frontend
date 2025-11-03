import React, { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage } from "../utils/chatApi";
import MessageForm from "./MessageForm";
import { api } from "../utils/api";

export default function ChatWindow({ convId }) {
  const [messages, setMessages] = useState([]);
  const token = localStorage.getItem("token");
  const subRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    connect(token, () => {
      if (subRef.current) subRef.current.unsubscribe();
      subRef.current = subscribe(convId, (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    });

    (async () => {
      try {
        const data = await api.fetchConversationMessages(convId);
        setMessages(data.content ? data.content.reverse() : data);
      } catch (err) {
        console.error("Erreur chargement messages:", err);
      }
    })();

    return () => {
      if (subRef.current) subRef.current.unsubscribe();
    };
  }, [convId, token]);

  const handleSend = async (content) => {
    try {
      sendMessage(convId, content);
    } catch (err) {
      console.error("WS not connected", err);
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id || Math.random()}>
            <strong>{m.senderUsername}</strong>: {m.content}
          </div>
        ))}
      </div>
      <MessageForm onSend={handleSend} />
    </div>
  );
}
