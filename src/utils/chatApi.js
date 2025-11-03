import SockJS from "sockjs-client";
import { over } from "stompjs";

let stompClient = null;
let connected = false;

/**
 * Connecte le client STOMP au backend WebSocket avec JWT.
 * @param {string} jwtToken - Token JWT de l'utilisateur
 * @param {function} onConnect - Callback à la connexion réussie
 */
export function connect(jwtToken, onConnect) {
  const socket = new SockJS("http://172.28.24.211:8080/ws");
  stompClient = over(socket);

  const headers = { Authorization: `Bearer ${jwtToken}` };

  stompClient.connect(
    headers,
    () => {
      console.log("✅ Connected to WS");
      connected = true;
      if (onConnect) onConnect();
    },
    (error) => {
      console.error("❌ WS connection error:", error);
      connected = false;
    }
  );

  return stompClient;
}

/**
 * S'abonne à une conversation pour recevoir les messages en temps réel.
 * @param {string|number} convId - ID de la conversation
 * @param {function} callback - Fonction appelée pour chaque message reçu
 */
export function subscribeToConversation(convId, callback) {
  if (!stompClient || !connected) {
    console.warn("⚠ STOMP client not connected yet");
    return;
  }

  stompClient.subscribe(`/topic/conversations/${convId}`, (msg) => {
    if (msg.body) callback(JSON.parse(msg.body));
  });
}

/**
 * Envoie un message à une conversation via WebSocket.
 * @param {string|number} convId - ID de la conversation
 * @param {object} payload - Contenu du message { content: "..." }
 */
export function sendMessage(convId, payload) {
  if (!stompClient || !connected) {
    console.warn("⚠ Cannot send message, STOMP not connected");
    return;
  }

  // On envoie sur le mapping configuré côté backend
  stompClient.send(`/app/chat.sendMessage`, {}, JSON.stringify(payload));
}
