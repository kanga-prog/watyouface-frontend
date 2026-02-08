import { useEffect, useState, useRef } from "react";
import { connect, subscribe, sendMessage } from "@/utils/chatApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mediaUrl, defaultAvatar } from "../utils/media";

export default function Messages({ conversationId, jwtToken }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll auto vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Connexion + abonnement au WebSocket
  useEffect(() => {
    if (!jwtToken || !conversationId) return;

    // 1️⃣ Connexion STOMP (async)
    connect(jwtToken, (client) => {
      console.log("🔥 CONNECTED, subscribing to conversation", conversationId);

      // 2️⃣ Une fois connecté → on s'abonne
      subscribe(conversationId, (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    });
  }, [jwtToken, conversationId]);

  // Envoi de message
  const handleSend = () => {
    if (!content.trim()) return;
    sendMessage(conversationId, content);
    setContent("");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto rounded-2xl shadow-lg border">
      <CardContent className="p-6 space-y-4">

        {/* Messages list */}
        <div className="h-96 overflow-y-auto p-4 bg-muted rounded-xl space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white shadow text-sm"
            >
              <strong>{msg.senderName || "Utilisateur"}</strong><br />
              {msg.content}
            </div>
          ))}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Input + bouton */}
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Écrire un message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSend} className="rounded-xl px-6">
            Envoyer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
