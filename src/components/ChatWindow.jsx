import React, { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage } from "../utils/chatApi";
import MessageForm from "./MessageForm";
import { api } from "../utils/api";

export default function ChatWindow({ convId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const subRef = useRef(null);
  const scrollRef = useRef(null);

  // 🔄 Scroll automatique vers le bas
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // 🔗 Helper pour les URLs (avatars)
  const buildMediaUrl = (path) => {
    if (!path) return "http://localhost:8080/uploads/avatars/default.png";
    return path.startsWith("http")
      ? path
      : `http://localhost:8080${path}`;
  };

  // 📩 Charger les anciens messages
  useEffect(() => {
    if (!token || !convId) return;

    const loadMessages = async () => {
      try {
        const data = await api.fetchConversationMessages(convId);
        const list = data.content ? data.content.reverse() : data;
        setMessages(list);
      } catch (err) {
        console.error("Erreur chargement messages:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [convId, token]);

  // 🔌 Connexion WebSocket
  useEffect(() => {
    if (!token || !convId) return;

    connect(token, () => {
      if (subRef.current) subRef.current.unsubscribe();
      subRef.current = subscribe(convId, (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    });

    return () => {
      if (subRef.current) subRef.current.unsubscribe();
    };
  }, [convId, token]);

  // 🔽 Scroll auto à chaque nouveau message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✉️ Envoi de message
  const handleSend = (content) => {
    if (!content.trim()) return;
    try {
      sendMessage(convId, content);
    } catch (err) {
      console.error("❌ Erreur envoi WS:", err);
    }
  };

  // 🧱 Interface principale
  return (
    <div className="flex-1 flex flex-col h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-2 p-3 bg-gray-50 rounded-lg border"
      >
        {loading ? (
          <p className="text-center text-gray-500">Chargement du chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">
            Aucun message pour cette conversation.
          </p>
        ) : (
          messages.map((m) => {
            const isOwn = m.senderUsername === username;
            const avatarUrl = buildMediaUrl(m.senderAvatarUrl);

            return (
              <div
                key={m.id || Math.random()}
                className={`flex items-end mb-3 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {/* Avatar à gauche pour les autres */}
                {!isOwn && (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover border border-gray-300"
                    onError={(e) => {
                      e.target.src =
                        "http://localhost:8080/uploads/avatars/default.png";
                    }}
                  />
                )}

                {/* Message */}
                <div
                  className={`max-w-[70%] p-2 rounded-lg shadow ${
                    isOwn
                      ? "bg-blue-500 text-white ml-2"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      {m.senderUsername}
                    </p>
                  )}
                  <p className="text-sm break-words">{m.content}</p>
                  <p className="text-[10px] text-right text-gray-400 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Avatar à droite pour soi */}
                {isOwn && (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-8 h-8 rounded-full ml-2 object-cover border border-gray-300"
                    onError={(e) => {
                      e.target.src =
                        "http://localhost:8080/uploads/avatars/default.png";
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Formulaire d’envoi */}
      <MessageForm onSend={handleSend} />
    </div>
  );
}
