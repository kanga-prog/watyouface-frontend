// src/components/LikeButton.jsx
import { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function LikeButton({ postId = null, videoId = null, initialLikeCount, initialLiked }) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.toggleLike({ postId, videoId });
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
      setLiked(!liked);
    } catch (err) {
      alert("Erreur lors du like");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center space-x-1 text-sm font-medium ${
        liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
      }`}
    >
      {liked ? "❤️" : "🤍"} <span>{likeCount}</span>
    </button>
  );
}
