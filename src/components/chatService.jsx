import SockJS from "sockjs-client";
import { over } from "stompjs";

let stompClient = null;

export function connect(onMessage) {
  const socket = new SockJS("http://172.28.24.211:8080/ws");
  stompClient = over(socket);
  stompClient.connect({}, () => {
    console.log("✅ Connected to WS");
  });
  return stompClient;
}

export function subscribeToConversation(convId, callback) {
  if (!stompClient) return;
  stompClient.subscribe(`/topic/conversations/${convId}`, (msg) => {
    callback(JSON.parse(msg.body));
  });
}

export function sendMessage(convId, payload) {
  fetch(`/api/messages/${convId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
