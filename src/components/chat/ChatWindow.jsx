import React, { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage } from "../../utils/chatApi";
import MessageForm from "./MessageForm";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media";

const avatarSrc = (url) => (url ? mediaUrl(url) : defaultAvatar);

export default function ChatWindow({ convId, jwtToken, username }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const subRef = useRef(null);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  /* ===== Charger l’historique ===== */
  useEffect(() => {
    if (!jwtToken || !convId) return;

    setLoading(true);
    fetch(
      `${import.meta.env.VITE_API_BASE}/api/messages/conversations/${convId}/messages`,
      {
        headers: { Authorization: `Bearer ${jwtToken}` },
      }
    )
      .then((res) => res.json())
      .then((data) =>
        setMessages(Array.isArray(data) ? data : data?.content || [])
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [convId, jwtToken]);

  /* ===== WebSocket temps réel ===== */
  useEffect(() => {
    if (!jwtToken || !convId) return;

    connect(jwtToken, () => {
      subRef.current?.unsubscribe();
      subRef.current = subscribe(convId, (msg) =>
        setMessages((prev) => [...prev, msg])
      );
    });

    return () => subRef.current?.unsubscribe();
  }, [convId, jwtToken]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = (content) => {
    if (!content.trim()) return;
    sendMessage(convId, content);
  };

  return (
    <div className="flex-1 flex flex-col bg-blue-50">

      {/* 💬 Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 p-3"
      >
        {loading ? (
          <p className="text-center text-gray-500 mt-4">
            Chargement du chat…
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">
            Aucun message pour cette conversation.
          </p>
        ) : (
          messages.map((m) => {
            const isOwn = m.senderUsername === username;
            const avatar = avatarSrc(m.senderAvatarUrl);

            return (
              <div
                key={m.id}
                className={`flex items-end ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {!isOwn && (
                  <Avatar size="md">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[70%] p-2 rounded-lg shadow ${
                    isOwn ? "bg-blue-500 text-white" : "bg-white text-gray-800"
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

                {isOwn && (
                  <Avatar className="w-6 h-6 ml-2 shrink-0">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ✍️ Formulaire */}
      <MessageForm onSend={handleSend} />
    </div>
  );
}
