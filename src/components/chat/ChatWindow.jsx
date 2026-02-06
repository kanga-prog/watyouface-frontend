import React, { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage } from "../../utils/chatApi";
import MessageForm from "./MessageForm";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

export default function ChatWindow({ convId, jwtToken, username }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const subRef = useRef(null);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  const buildMediaUrl = (path) =>
    path ? (path.startsWith("http") ? path : `http://localhost:8080${path}`) : "http://localhost:8080/uploads/avatars/default.png";

  useEffect(() => {
    if (!jwtToken || !convId) return;
    const loadMessages = async () => {
      try {
        const data = await fetch(`http://localhost:8080/api/messages/conversations/${convId}/messages`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }).then((res) => res.json());
        const list = Array.isArray(data) ? data : data.content?.reverse() || [];
        setMessages(list);
      } catch (err) {
        console.error("Erreur chargement messages:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [convId, jwtToken]);

  useEffect(() => {
    if (!jwtToken || !convId) return;
    connect(jwtToken, () => {
      if (subRef.current) subRef.current.unsubscribe();
      subRef.current = subscribe(convId, (msg) => setMessages((prev) => [...prev, msg]));
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
            return (
              <div key={m.id || Math.random()} className={`flex items-end mb-3 ${isOwn ? "justify-end" : "justify-start"}`}>
                {!isOwn && (
                  <Avatar size="xxs">
                    <AvatarImage src={buildMediaUrl(m.senderAvatarUrl)} />
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[70%] p-2 rounded-lg shadow ${isOwn ? "bg-blue-500 text-white ml-2" : "bg-gray-200 text-gray-800"}`}>
                  {!isOwn && (
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      {m.senderUsername?.charAt(0).toUpperCase() + m.senderUsername?.slice(1)}
                    </p>
                  )}
                  <p className="text-sm break-words">{m.content}</p>
                  <p className="text-[10px] text-right text-gray-400 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {isOwn && (
                  <Avatar size="xxs">
                    <AvatarImage src={buildMediaUrl(m.senderAvatarUrl)} />
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
