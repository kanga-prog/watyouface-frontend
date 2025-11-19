import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";

let client = null;
const subscriptions = {}; // garder trace des souscriptions

/**
 * Connexion STOMP via SockJS + JWT
 */
export function connect(jwtToken, onConnect) {
  if (client && client.active) {
    console.log("⚡ Déjà connecté au WS");
    if (onConnect) onConnect(client);
    return client;
  }

  client = new Client({
    brokerURL: undefined, // SockJS utilisée
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: {
      Authorization: `Bearer ${jwtToken}`,
    },
    debug: (str) => console.log("📡 STOMP:", str),
    reconnectDelay: 5000, // reconnect auto

    onConnect: (frame) => {
      console.log("✅ WS connecté au serveur", WS_URL);
      if (onConnect) onConnect(client); // <- onConnect reçoit client actif
    },

    onStompError: (frame) => {
      console.error("❌ Erreur STOMP:", frame.headers['message']);
    },

    onWebSocketError: (err) => {
      console.error("⚠️ Erreur WebSocket:", err);
    },
  });

  console.log("📡 STOMP: Opening Web Socket...");
  client.activate();
  return client;
}

/**
 * S’abonner à une conversation (après connexion)
 */
export function subscribe(convId, handler) {
  if (!client || !client.connected) {
    console.warn("⚠️ Client STOMP non encore connecté, attente...");
    return;
  }

  const topic = `/topic/conversations/${convId}`;

  // Évite double abonnement
  if (subscriptions[topic]) {
    console.log(`↩️ Déjà abonné à ${topic}`);
    return subscriptions[topic];
  }

  console.log(`📩 Souscription au topic: ${topic}`);

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

/**
 * Envoi d’un message à la conversation
 */
export function sendMessage(conversationId, content) {
  if (!client || !client.connected) {
    throw new Error("❌ WebSocket non connecté !");
  }

  const payload = { conversationId, content };

  client.publish({
    destination: "/app/chat.sendMessage",
    body: JSON.stringify(payload),
  });

  console.log("✉️ Message envoyé:", payload);
}
