// src/utils/chatApi.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client = null;

export function connect(jwtToken, onConnect) {
  if (client && client.connected) return client;

  client = new Client({
    brokerURL: undefined, // utilisation de SockJS
    webSocketFactory: () => new SockJS("http://172.28.24.211:8080/ws"),
    connectHeaders: {
      Authorization: `Bearer ${jwtToken}`,
    },
    debug: (str) => console.log("📡 STOMP debug:", str),
    onConnect: (frame) => {
      console.log("✅ STOMP connected", frame);
      if (onConnect) onConnect();
    },
    onStompError: (frame) => console.error("STOMP error", frame),
    reconnectDelay: 5000,
  });

  client.activate();
  return client;
}

export function subscribe(convId, handler) {
  if (!client || !client.connected) return;
  return client.subscribe(`/topic/conversations/${convId}`, (msg) => {
    const body = JSON.parse(msg.body);
    handler(body);
  });
}

export function sendMessage(conversationId, content) {
  if (!client || !client.connected) throw new Error("WS not connected");
  const payload = { conversationId, content };
  client.publish({
    destination: `/app/chat.sendMessage`,
    body: JSON.stringify(payload),
  });
}
