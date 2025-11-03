// src/pages/ChatPage.jsx
import React, { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import MessageForm from "../components/MessageForm";
import { api } from "../utils/api";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const jwtToken = localStorage.getItem("token");

  useEffect(() => {
    if (!jwtToken) return;

    const loadConversations = async () => {
      try {
        const res = await api.getConversations(); // À implémenter côté API
        const data = await res.json();
        setConversations(data);
        if (data.length > 0) setSelectedConvId(data[0].id);
      } catch (err) {
        console.error("Erreur chargement conversations:", err);
      }
    };
    loadConversations();
  }, [jwtToken]);

  return (
    <div className="flex max-w-4xl mx-auto p-4 border">
      <ChatList
        conversations={conversations}
        selectedConvId={selectedConvId}
        onSelect={setSelectedConvId}
      />
      {selectedConvId && (
        <div className="flex-1 flex flex-col ml-4">
          <ChatWindow convId={selectedConvId} jwtToken={jwtToken} />
          <MessageForm convId={selectedConvId} />
        </div>
      )}
    </div>
  );
}
