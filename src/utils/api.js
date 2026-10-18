// src/utils/api.js

// 🔧 Base API sécurisée avec fallback
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8080";

const nativeFetch = globalThis.fetch.bind(globalThis);
let stateChangingRequest = Promise.resolve();

async function getCsrfToken() {
  const response = await nativeFetch(`${API_BASE}/api/auth/csrf`, { credentials: "include" });
  if (!response.ok) throw new Error("Impossible d'initialiser la protection CSRF");
  const payload = await response.json();
  if (!payload?.token) throw new Error("Jeton CSRF absent");
  return payload.token;
}

async function apiFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    // Spring rotates the CSRF cookie after a successful state-changing request.
    // Serialize mutations and fetch the current token for each one, so a stale
    // cached token cannot turn the next authenticated request into a 401/403.
    const send = async () => {
      headers.set("X-XSRF-TOKEN", await getCsrfToken());
      return nativeFetch(url, { ...options, method, headers, credentials: "include" });
    };
    const request = stateChangingRequest.then(send, send);
    stateChangingRequest = request.then(() => undefined, () => undefined);
    return request;
  }
  return nativeFetch(url, { ...options, method, headers, credentials: "include" });
}

// All application API requests use cookies and the CSRF header centrally.
const fetch = apiFetch;

// 🧪 Aide debug en dev
if (import.meta.env.DEV) {
  console.log("🌍 API_BASE =", API_BASE);
  if (!API_BASE) {
    console.error("❌ VITE_API_BASE est undefined !");
  }
}
async function parseError(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await res.json().catch(() => null);
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    return data ? JSON.stringify(data) : `HTTP ${res.status}`;
  }
  const text = await res.text().catch(() => "");
  return text || `HTTP ${res.status}`;
}

async function adminPage(resource, { query = "", page = 0, size = 20 } = {}) {
  const qs = new URLSearchParams({ page: String(page), size: String(size) });
  if (query) qs.set("query", query);
  const res = await fetch(`${API_BASE}/api/admin/${resource}?${qs.toString()}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}


export const api = {
  // Compatibility for existing call sites; authentication is cookie-based, never a JS token header.
  authHeader: () => ({}),
  jsonHeaders: () => ({ "Content-Type": "application/json" }),
  errorMessage: parseError,

  // =========================
  // 🔐 AUTH
  // =========================
  login: (credentials) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    fetch(`${API_BASE}/api/auth/logout`, { method: "POST" }),

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/api/users/me`);
    if (!res.ok) throw new Error(`Session indisponible (${res.status})`);
    return res.json();
  },

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

  updatePost: (id, payload) =>
    fetch(`${API_BASE}/api/posts/${id}`, {
      method: "PUT",
      headers: api.jsonHeaders(),
      body: JSON.stringify(payload),
    }),

  deletePost: (id) =>
    fetch(`${API_BASE}/api/posts/${id}`, {
      method: "DELETE",
      headers: api.authHeader(),
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

    if (!res.ok) throw new Error(await parseError(res));
    return await res.text();
  },


    // =========================
    // 🏪 MARKETPLACE
    // =========================
 getListings: async () => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings`, {
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },


  payListing: async (listingId) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings/${listingId}/pay`, {
      method: "POST",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

   createListing: async (listingData) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings`, {
      method: "POST",
      headers: api.jsonHeaders(),
      body: JSON.stringify(listingData),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  // multipart (image upload)
  createListingMultipart: async (formData) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings`, {
      method: "POST",
      headers: api.authHeader(),
      body: formData,
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  requestPurchase: async (listingId) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings/${listingId}/request`, {
      method: "POST",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  acceptListing: async (listingId) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings/${listingId}/accept`, {
      method: "POST",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  refuseListing: async (listingId) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings/${listingId}/refuse`, {
      method: "POST",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  shipListing: async (listingId) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings/${listingId}/ship`, {
      method: "POST",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  receiveListing: async (listingId) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings/${listingId}/receive`, {
      method: "POST",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  // ADMIN: update listing fields
  updateListing: async (id, payload) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings/${id}`, {
      method: "PUT",
      headers: api.jsonHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  // ADMIN: delete listing
  deleteListing: async (id) => {
    const res = await fetch(`${API_BASE}/api/marketplace/listings/${id}`, {
      method: "DELETE",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json(); // {message:"Annonce supprimée"}
  },
 uploadMarketplaceImage: async (file) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE}/api/marketplace/listings/upload`, {
      method: "POST",
      headers: api.authHeader(),
      body: fd,
    });

    if (!res.ok) throw new Error(await parseError(res));
    return res.json(); // { imageUrl: "/media/marketplace/xxx.png" }
  },
  
     // =========================
      // 🏪 WALLET
     // =========================

  getMyWallet: async () => {
      const res = await fetch(`${API_BASE}/api/wallet/me`, { headers: api.authHeader() });
      if (!res.ok) throw new Error(await parseError(res));
      return res.json(); // { userId, balance }
    },

  creditMyWallet: async (amount) => {
    const res = await fetch(`${API_BASE}/api/wallet/me/credit`, {
      method: "POST",
      headers: api.jsonHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json(); // { userId, balance }
  },

  // =========================
  // 🛡️ ADMIN
  // =========================
  adminGetUsers: async ({ query = "", page = 0, size = 20 } = {}) => {
    const qs = new URLSearchParams();
    if (query) qs.set("query", query);
    qs.set("page", String(page));
    qs.set("size", String(size));

    const res = await fetch(`${API_BASE}/api/admin/users?${qs.toString()}`, {
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  adminGetPosts: (params = {}) => adminPage("posts", params),
  adminGetComments: (params = {}) => adminPage("comments", params),
  adminGetListings: (params = {}) => adminPage("listings", params),

  adminCreditWallet: async (userId, amount) => {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/wallet/credit`, {
      method: "POST",
      headers: api.jsonHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  adminDeletePost: async (id) => {
    const res = await fetch(`${API_BASE}/api/admin/posts/${id}`, {
      method: "DELETE",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  adminDeleteComment: async (id) => {
    const res = await fetch(`${API_BASE}/api/admin/comments/${id}`, {
      method: "DELETE",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  adminDeleteListing: async (id) => {
    const res = await fetch(`${API_BASE}/api/admin/listings/${id}`, {
      method: "DELETE",
      headers: api.authHeader(),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },
    
};
