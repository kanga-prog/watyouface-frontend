// src/utils/api.js

// 🔧 Base API sécurisée avec fallback
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8080";

// 🧪 Aide debug en dev
if (import.meta.env.DEV) {
  console.log("🌍 API_BASE =", API_BASE);
  if (!API_BASE) {
    console.error("❌ VITE_API_BASE est undefined !");
  }
}

export const api = {
  // 🔐 TOKEN
  getToken: () => localStorage.getItem("token"),

  authHeader: () => ({
    Authorization: `Bearer ${api.getToken()}`,
  }),

  jsonHeaders: () => ({
    ...api.authHeader(),
    "Content-Type": "application/json",
  }),

  // =========================
  // 🔐 AUTH
  // =========================
  login: (credentials) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }),

  register: (data) =>
    fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  // =========================
  // 🧱 POSTS
  // =========================
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

  // =========================
  // ❤️ LIKES
  // =========================
  toggleLike: (payload) =>
    fetch(`${API_BASE}/api/likes/toggle`, {
      method: "POST",
      headers: api.jsonHeaders(),
      body: JSON.stringify(payload),
    }),

  // =========================
  // 💬 COMMENTS
  // =========================
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

  // =========================
  // 💬 CHAT
  // =========================
  fetchConversationMessages: async (id) => {
    const res = await fetch(
      `${API_BASE}/api/messages/conversations/${id}/messages`,
      { headers: api.authHeader() }
    );
    if (!res.ok) {
      throw new Error(`Erreur messages (${res.status})`);
    }
    return res.json();
  },

  getConversations: async () => {
    const res = await fetch(`${API_BASE}/api/conversations`, {
      headers: api.authHeader(),
    });
    if (!res.ok) {
      throw new Error(`Erreur conversations (${res.status})`);
    }
    return res.json();
  },

  getOrCreateConversation: async (userId) => {
    const res = await fetch(
      `${API_BASE}/api/conversations/with/${userId}`,
      {
        method: "POST",
        headers: api.authHeader(),
      }
    );
    if (!res.ok) {
      throw new Error(`Erreur création conversation (${res.status})`);
    }
    return res.json();
  },

  // =========================
  // 👤 PROFIL
  // =========================
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/api/users/me`, {
      headers: api.authHeader(),
    });
    if (!res.ok) {
      throw new Error(`Erreur profil (${res.status})`);
    }
    return res.json();
  },

  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append("file", file);

    return fetch(`${API_BASE}/api/users/avatar`, {
      method: "POST",
      headers: api.authHeader(),
      body: fd,
    });
  },

  updateUsername: (username) =>
  fetch(`${API_BASE}/api/users/update`, {
    method: "PUT",
    headers: api.jsonHeaders(),
    body: JSON.stringify({ username }),
  }),
  getUsers: async () => {
  const res = await fetch(`${API_BASE}/api/users`, {
    headers: api.authHeader(),
  });
  if (!res.ok) {
    throw new Error(`Erreur users (${res.status})`);
  }
  return res.json();
  },

    // =========================
  // 📜 CONTRACTS
  // =========================
  getActiveContract: () =>
    fetch(`${API_BASE}/api/contracts/active`),

  downloadContract: (id) =>
    fetch(`${API_BASE}/api/contracts/${id}/download`, {
      headers: api.authHeader(),
    }),

  acceptContract: async (userId, contractId, accepted) => {
    const res = await fetch(`${API_BASE}/api/contracts/accept`, {
      method: "POST",
      headers: api.jsonHeaders(),
      body: JSON.stringify({ userId, contractId, accepted }),
    });

    if (!res.ok) throw new Error(await res.text());
    return res.text();
  },


    // =========================
    // 🏪 MARKETPLACE
    // =========================
  getListings: async () => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings`, {
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(`Erreur marketplace (${res.status})`);
    return res.json();
  },

  payListing: async (listingId) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings/${listingId}/pay`, {
      method: "POST",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(`Erreur paiement (${res.status})`);
    return res.json();
  },


  createListing: async (listingData) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings`, {
      method: "POST",
      headers: api.jsonHeaders(),
      body: JSON.stringify(listingData),
    });
    if (!res.ok) throw new Error(`Erreur création listing (${res.status})`);
    return res.json();
  },
};