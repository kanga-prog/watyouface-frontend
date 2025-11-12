import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";

let client = null;

export function connect(jwtToken, onConnect) {
  if (client && client.connected) return client;

  client = new Client({
    brokerURL: undefined, // SockJS utilisée
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: {
      Authorization: `Bearer ${jwtToken}`,
    },
    debug: (str) => console.log("📡 STOMP:", str),
    reconnectDelay: 5000,

    onConnect: (frame) => {
      console.log("✅ WS connecté");
      if (onConnect) onConnect();
    },

    onStompError: (frame) => {
      console.error("❌ Erreur STOMP:", frame);
    },
  });

  client.activate();
  return client;
}

export function subscribe(convId, handler) {
  if (!client || !client.connected) {
    console.warn("⚠️ Client STOMP non connecté");
    return;
  }

  const topic = `/topic/conversations/${convId}`;

  // Empêche souscription multiple
  if (client.subscriptions[topic]) {
    return client.subscriptions[topic];
  }

  return client.subscribe(topic, (msg) => {
    handler(JSON.parse(msg.body));
  });
}

export function sendMessage(conversationId, content) {
  if (!client || !client.connected) throw new Error("WS non connecté");

  const payload = { conversationId, content };

  client.publish({
    destination: `/app/chat.sendMessage`,
    body: JSON.stringify(payload),
  });
}
