import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// Fallback pour WS si .env mal configuré
const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";

let client = null;
const subscriptions = {};

/**
 * Connexion STOMP via SockJS; the HTTP handshake carries the HttpOnly auth cookie.
 */
export function connect(onConnect) {
  if (client && client.active) {
    console.log("⚡ Déjà connecté au WS");
    onConnect?.(client);
    return client;
  }

  client = new Client({
    brokerURL: undefined, // SockJS obligatoire
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: {},
    reconnectDelay: 5000,
    debug: (str) => console.log("📡 STOMP:", str),
    onConnect: () => {
      console.log("✅ WS connecté :", WS_URL);
      onConnect?.(client);
    },
    onStompError: (frame) => console.error("❌ STOMP error:", frame.headers["message"]),
    onWebSocketError: (err) => console.error("⚠️ WebSocket error:", err),
  });

  client.activate();
  return client;
}

/**
 * S’abonner à une conversation
 */
export function subscribe(convId, handler) {
  if (!client || !client.connected) return;

  const topic = `/topic/conversations/${convId}`;
  if (subscriptions[topic]) return subscriptions[topic];

  const sub = client.subscribe(topic, (msg) => {
    try {
      handler(JSON.parse(msg.body));
    } catch (err) {
      console.error("Erreur parsing message WS:", err, msg.body);
    }
  });

  subscriptions[topic] = sub;
  return sub;
}

/**
 * Envoi d’un message
 */
export function sendMessage(convId, content) {
  if (!client || !client.connected) throw new Error("WebSocket non connecté");

  client.publish({
    destination: "/app/chat.sendMessage",
    body: JSON.stringify({ conversationId: convId, content }),
  });
}
