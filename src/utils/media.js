//src/utils/media.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export const mediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};

export const defaultAvatar =
  `${API_BASE}/media/avatars/default.png`;
