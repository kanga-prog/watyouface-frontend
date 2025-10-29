// src/utils/api.js
const API_BASE = "http://localhost:8080";

export const api = {
  getToken: () => localStorage.getItem("token"),

  // Pour les requêtes JSON
  jsonHeaders: () => ({
    Authorization: `Bearer ${api.getToken()}`,
    "Content-Type": "application/json",
  }),

  // Pour les requêtes multipart (upload)
  authHeader: () => ({
    Authorization: `Bearer ${api.getToken()}`,
  }),

  // 🔹 POSTS
  getPosts: () => fetch(`${API_BASE}/api/posts`, { headers: api.authHeader() }),
  createPost: (formData) =>
    fetch(`${API_BASE}/api/posts`, {
      method: "POST",
      headers: api.authHeader(), // Pas de Content-Type → multipart auto
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
    fetch(`${API_BASE}/api/comments/post/${postId}`, { headers: api.authHeader() }),
  addComment: (postId, content) =>
    fetch(`${API_BASE}/api/comments`, {
      method: "POST",
      headers: api.jsonHeaders(),
      body: JSON.stringify({ postId, content }),
    }),
};