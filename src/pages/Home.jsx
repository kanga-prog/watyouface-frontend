// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/PostCard";
import ChatWindow from "../components/ChatWindow";
import MessageForm from "../components/MessageForm";
import { api } from "../utils/api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState(null);
  const navigate = useNavigate();

  // Charger les posts
  const loadPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setJwtToken(token);

    try {
      const res = await api.getPosts();
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Erreur chargement posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // ID de conversation de test (exemple)
  const conversationId = 1;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <CreatePostForm onPostCreated={loadPosts} />

      {/* Liste des posts */}
      {loading ? (
        <p className="text-center text-gray-500">Chargement du fil...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">Aucun post pour le moment.</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}

      {/* --- Zone de chat --- */}
      <div className="mt-8 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">💬 Chat en direct</h2>
        {jwtToken ? (
          <>
            <ChatWindow convId={conversationId} jwtToken={jwtToken} />
            <MessageForm convId={conversationId} />
          </>
        ) : (
          <p className="text-gray-500">Connectez-vous pour discuter.</p>
        )}
      </div>
    </div>
  );
}
