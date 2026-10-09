import React, { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage } from "../../utils/chatApi";
import { api } from "../../utils/api";
import MessageForm from "./MessageForm";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media";

const avatarSrc = (url) => (url ? mediaUrl(url) : defaultAvatar);

function formatMessageTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatWindow({ convId, username }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const subRef = useRef(null);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  /* ===== Charger l’historique ===== */
  useEffect(() => {
    if (!convId) return;

    setLoading(true);
    setError(null);
    api.fetchConversationMessages(convId)
      .then((data) =>
        setMessages(Array.isArray(data) ? data : data?.content || [])
      )
      .catch((loadError) => {
        setMessages([]);
        setError(
          /\(403\)/.test(loadError.message)
            ? "Accès interdit à cette conversation."
            : "Impossible de charger les messages de cette conversation."
        );
      })
      .finally(() => setLoading(false));
  }, [convId]);

  /* ===== WebSocket temps réel ===== */
  useEffect(() => {
    if (!convId) return;

    connect(() => {
      subRef.current?.unsubscribe();
      subRef.current = subscribe(convId, (msg) =>
        setMessages((prev) => [...prev, msg])
      );
    });

    return () => subRef.current?.unsubscribe();
  }, [convId]);

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
        ) : error ? (
          <p role="alert" className="mx-auto mt-4 max-w-md rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-800">
            {error}
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">
            Aucun message pour cette conversation.
          </p>
        ) : (
          messages.map((m) => {
            const isOwn = m.senderUsername === username;
            const avatar = avatarSrc(m.senderAvatarUrl);
            // MessageDTO serializes the timestamp as `sentAt` for both REST and STOMP.
            const messageTime = formatMessageTime(m.sentAt);

            return (
              <div
                key={m.id}
                className={`flex items-end ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {!isOwn && (
                  <Avatar size="chat" className="shrink-0">
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
                  {messageTime && (
                    <time
                      dateTime={m.sentAt}
                      className="mt-1 block text-right text-[10px] text-gray-400"
                    >
                      {messageTime}
                    </time>
                  )}
                </div>

                {isOwn && (
                  <Avatar size="chat" className="shrink-0">
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
