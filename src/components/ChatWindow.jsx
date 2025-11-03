import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function ChatWindow({ convId = 1, jwtToken }) {
  const [messages, setMessages] = useState([]);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!jwtToken) {
      console.warn("⚠️ Aucun token JWT trouvé, connexion WebSocket annulée");
      return;
    }

    console.log("🔌 Connexion WebSocket en cours...");

    // ⚙️ Crée le client STOMP
    const client = new Client({
      webSocketFactory: () =>
        new SockJS("http://172.28.24.211:8080/ws"), // ✅ ton backend
      connectHeaders: {
        Authorization: `Bearer ${jwtToken}`,
      },
      debug: (str) => console.log("📡 STOMP debug:", str),

      onConnect: (frame) => {
        console.log("✅ Connecté au broker STOMP:", frame.headers);

        // Abonnement à la conversation spécifique
        const topic = `/topic/conversations/${convId}`;
        console.log(`📨 Abonnement à ${topic}`);

        client.subscribe(topic, (message) => {
          console.log("💬 Message reçu via STOMP:", message.body);
          try {
            const payload = JSON.parse(message.body);
            setMessages((prev) => [...prev, payload]);
          } catch (e) {
            console.error("❌ Erreur parsing message:", e);
          }
        });
      },

      onStompError: (frame) => {
        console.error("❌ Erreur STOMP:", frame.headers["message"]);
        console.error("Détails:", frame.body);
      },

      onWebSocketError: (error) => {
        console.error("❌ Erreur WebSocket:", error);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("🔌 Déconnexion du WebSocket...");
      client.deactivate();
    };
  }, [convId, jwtToken]);

  // 📨 Envoi d’un message
  const handleSend = (text) => {
    if (clientRef.current && clientRef.current.connected) {
      const destination = `/app/chat.sendMessage/${convId}`;
      console.log("📤 Envoi vers:", destination, "contenu:", text);

      clientRef.current.publish({
        destination,
        body: JSON.stringify({ content: text }),
      });
    } else {
      console.warn("⚠️ WebSocket non connecté, message non envoyé.");
    }
  };

  return (
    <div className="chat-window border p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">💬 Chat (convId: {convId})</h2>

      <div className="messages bg-gray-50 p-3 rounded-md h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-400">Aucun message pour le moment.</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="mb-2">
              <strong>{m.sender?.username || "Anonyme"}:</strong> {m.content}
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.target.elements.msg;
          const text = input.value.trim();
          if (text) handleSend(text);
          input.value = "";
        }}
        className="flex mt-3 gap-2"
      >
        <input
          name="msg"
          type="text"
          placeholder="Tape ton message..."
          className="border rounded px-3 py-2 flex-grow"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded-md"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
