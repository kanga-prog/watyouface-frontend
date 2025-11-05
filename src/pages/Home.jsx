// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/PostCard";
import ChatWindow from "../components/ChatWindow";
import MessageForm from "../components/MessageForm";
import ChatList from "../components/ChatList";
import { api } from "../utils/api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);

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

  // Charger les conversations
  const loadConversations = async () => {
    try {
      const data = await api.getConversations(); // À implémenter côté API
      setConversations(data);
      if (data.length > 0) setSelectedConvId(data[0].id);
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
    }
  };

  useEffect(() => {
    loadPosts();
    loadConversations();
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Colonne centrale : fil d’actualités */}
      <div className="flex-1 max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <CreatePostForm onPostCreated={loadPosts} />
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Chargement du fil...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">Aucun post pour le moment.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow p-4">
              <PostCard post={post} />
            </div>
          ))
        )}
      </div>

      {/* Colonne droite : Chat */}
      <div className="w-80 border-l bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-700">💬 Conversations</h2>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          <ChatList
            conversations={conversations}
            selectedConvId={selectedConvId}
            onSelect={setSelectedConvId}
          />
        </div>

        {/* Zone de chat */}
        <div className="border-t p-3 flex flex-col h-96">
          {jwtToken && selectedConvId ? (
            <>
              <ChatWindow convId={selectedConvId} jwtToken={jwtToken} />
              <MessageForm convId={selectedConvId} />
            </>
          ) : (
            <p className="text-gray-500 text-sm text-center mt-4">
              Sélectionnez une conversation pour discuter
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
