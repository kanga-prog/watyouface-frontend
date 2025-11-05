import React, { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage } from "../utils/chatApi";
import MessageForm from "./MessageForm";
import { api } from "../utils/api";

export default function ChatWindow({ convId }) {
  const [messages, setMessages] = useState([]);
  const token = localStorage.getItem("token");
  const subRef = useRef(null);
  const messagesEndRef = useRef(null); // <- référence pour scroll automatique

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

  // Scroll automatique quand messages changent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (content) => {
    try {
      sendMessage(convId, content);
    } catch (err) {
      console.error("WS not connected", err);
    }
  };

  return (
    <div className="chat-window flex flex-col h-full">
      <div className="messages flex-1 overflow-y-auto p-2">
        {messages.map((m) => (
          <div key={m.id || Math.random()} className="mb-2">
            <strong>{m.senderUsername}</strong>: {m.content}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* scroll automatique */}
      </div>
      <MessageForm onSend={handleSend} /> {/* placeholder déjà présent */}
    </div>
  );
}
