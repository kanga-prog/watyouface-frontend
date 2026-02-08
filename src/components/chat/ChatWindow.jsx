import React, { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage } from "../../utils/chatApi";
import MessageForm from "./MessageForm";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media";

export default function ChatWindow({ convId, jwtToken, username }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const subRef = useRef(null);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  // 📥 Charger l’historique
  useEffect(() => {
    if (!jwtToken || !convId) return;

    setLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE}/api/messages/conversations/${convId}/messages`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.content?.reverse() || [];
        setMessages(list);
      })
      .catch((err) => console.error("Erreur messages:", err))
      .finally(() => setLoading(false));
  }, [convId, jwtToken]);

  // 🔌 WebSocket
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
    <div className="flex-1 flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-2 p-3 bg-gray-50 rounded-lg border">
        {loading ? (
          <p className="text-center text-gray-500">Chargement du chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">Aucun message pour cette conversation.</p>
        ) : (
          messages.map((m) => {
            const isOwn = m.senderUsername === username;
            const avatarSrc = (m.senderAvatarUrl ? mediaUrl(m.senderAvatarUrl) : defaultAvatar) ? mediaUrl((m.senderAvatarUrl ? mediaUrl(m.senderAvatarUrl) : defaultAvatar)) : defaultAvatar;

            return (
              <div key={m.id || Math.random()} className={`flex items-end mb-3 ${isOwn ? "justify-end" : "justify-start"}`}>
                {!isOwn && (
                  <Avatar className="w-2 h-2">
                    <AvatarImage src={avatarSrc} />
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[70%] p-2 rounded-lg shadow ${isOwn ? "bg-blue-500 text-white ml-2" : "bg-gray-200 text-gray-800 ml-2"}`}>
                  {!isOwn && (
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      {m.senderUsername}
                    </p>
                  )}
                  <p className="text-sm break-words">{m.content}</p>
                  <p className="text-[10px] text-right text-gray-400 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {isOwn && (
                  <Avatar className="w-2 h-2 ml-2">
                    <AvatarImage src={avatarSrc} />
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
      </div>

      <MessageForm onSend={handleSend} />
    </div>
  );
}
