// src/utils/api.js
const API_BASE = "http://172.28.24.211:8080";

export const api = {
  getToken: () => localStorage.getItem("token"),

  jsonHeaders: () => ({
    Authorization: `Bearer ${api.getToken()}`,
    "Content-Type": "application/json",
  }),

  authHeader: () => ({
    Authorization: `Bearer ${api.getToken()}`,
  }),

  // 🔹 AUTH
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
  getPosts: () => fetch(`${API_BASE}/api/posts`, { headers: api.authHeader() }),

  createPost: (formData) =>
    fetch(`${API_BASE}/api/posts`, {
      method: "POST",
      headers: api.authHeader(),
      body: formData,
    }),

  // 🔹 LIKES
  toggleLike: (postId) =>
    fetch(`${API_BASE}/api/likes/toggle`, {
      method: "POST",
      headers: api.jsonHeaders(),
      body: JSON.stringify({ postId }),
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
};
