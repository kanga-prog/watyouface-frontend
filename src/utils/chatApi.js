import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";

let client = null;
const subscriptions = {}; // garder trace des souscriptions

export function connect(jwtToken, onConnect) {
  if (client && client.active) return client; // déjà connecté

  client = new Client({
    brokerURL: undefined, // SockJS utilisée
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: {
      Authorization: `Bearer ${jwtToken}`,
    },
    debug: (str) => console.log("📡 STOMP:", str),
    reconnectDelay: 5000,

    onConnect: (frame) => {
      console.log("✅ WS connecté au serveur", WS_URL);
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
  if (!client || !client.active) {
    console.warn("⚠️ Client STOMP non connecté");
    return;
  }

  const topic = `/topic/conversations/${convId}`;

  // Empêche souscription multiple
  if (subscriptions[topic]) return subscriptions[topic];

  const sub = client.subscribe(topic, (msg) => {
    try {
      handler(JSON.parse(msg.body));
    } catch (err) {
      console.error("Erreur parsing message:", err, msg.body);
    }
  });

  subscriptions[topic] = sub;
  return sub;
}

export function sendMessage(conversationId, content) {
  if (!client || !client.active) throw new Error("WS non connecté");

  const payload = { conversationId, content };

  client.publish({
    destination: `/app/chat.sendMessage`,
    body: JSON.stringify(payload),
  });
}
