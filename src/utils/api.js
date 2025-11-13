// src/utils/api.js
const API_BASE = "http://localhost:8080";

export const api = {
  getToken: () => localStorage.getItem("token"),

  jsonHeaders: () => ({
    Authorization: `Bearer ${api.getToken()}`,
    "Content-Type": "application/json",
  }),

  authHeader: () => ({
    Authorization: `Bearer ${api.getToken()}`,
  }),

  // 🔹 AUTHENTIFICATION
  login: (credentials) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }),

  acceptContract: (userEmail) =>
    fetch(`${API_BASE}/api/auth/accept-contract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    }),

  // 🔹 POSTS
  getPosts: () =>
    fetch(`${API_BASE}/api/posts`, {
      headers: api.authHeader(),
    }),

  createPost: (formData) =>
    fetch(`${API_BASE}/api/posts`, {
      method: "POST",
      headers: api.authHeader(),
      body: formData,
    }),

  // 🔹 LIKES
  toggleLike: ({ postId, videoId }) =>
    fetch(`${API_BASE}/api/likes/toggle`, {
      method: "POST",
      headers: api.jsonHeaders(),
      body: JSON.stringify({ postId, videoId }),
    }),

  // 🔹 COMMENTS
  getComments: (postId) =>
    fetch(`${API_BASE}/api/comments/post/${postId}`, {
      headers: api.authHeader(),
    }),

  addComment: (postId, content) =>
    fetch(`${API_BASE}/api/comments`, {
      method: "POST",
      headers: api.jsonHeaders(),
      body: JSON.stringify({ postId, content }),
    }),

  // 🔹 MESSAGES / CHAT
  fetchConversationMessages: async (conversationId) => {
    const res = await fetch(`${API_BASE}/api/messages/${conversationId}`, {
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(`Erreur chargement messages: ${res.status}`);
    return res.json();
  },

  getConversations: async () => {
    const res = await fetch(`${API_BASE}/api/conversations`, {
      headers: api.authHeader(),
    });
    if (!res.ok)
      throw new Error(`Erreur chargement conversations: ${res.status}`);
    return res.json();
  },

  // ✅ Créer ou récupérer une conversation entre deux utilisateurs
  getOrCreateConversation: async (otherUserId) => {
    const res = await fetch(`${API_BASE}/api/conversations/with/${otherUserId}`, {
      method: "POST",
      headers: api.authHeader(),
    });
    if (!res.ok)
      throw new Error(`Erreur création conversation: ${res.status}`);
    return res.json();
  },

  // 🔹 PROFIL & UTILISATEURS
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${API_BASE}/api/users/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${api.getToken()}` },
      body: formData,
    });
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/api/users/me`, {
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(`Erreur de profil : ${res.status}`);
    return res.json();
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/api/users`, {
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error("Erreur fetch users");
    return res.json();
  },

  createPrivateConversation: async (otherUserId) => {
    const res = await fetch(`${API_BASE}/api/conversations/private/${otherUserId}`, {
      method: "POST",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error("Erreur création conversation");
    return res.json();
  },

};
