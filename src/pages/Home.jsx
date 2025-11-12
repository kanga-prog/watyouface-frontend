import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/PostCard";
import ChatWindow from "../components/ChatWindow";
import ChatList from "../components/ChatList";
import { api } from "../utils/api";
import { connect, subscribe } from "../utils/chatApi";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);

  const navigate = useNavigate();

  // 🔹 Charger le profil utilisateur connecté
  const loadUser = async () => {
    try {
      const data = await api.getProfile();
      setCurrentUser(data);
    } catch (err) {
      console.warn("Erreur de chargement du profil :", err);
    }
  };

  // 🔹 Charger les posts
  const loadPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setJwtToken(token);

    try {
      const res = await api.getPosts();
      const data = await res.json();

      // ✅ Correction : si backend renvoie { content: [...] }
      const postsArray = Array.isArray(data) ? data : data.content || [];
      setPosts(postsArray);
    } catch (err) {
      console.error("Erreur de chargement des posts :", err);
      setPosts([]); // éviter crash en cas d’erreur
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Charger les conversations
  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      const convArray = Array.isArray(data) ? data : [];
      setConversations(convArray.map((c) => ({ ...c, unread: false })));

      if (convArray.length > 0) setSelectedConvId(convArray[0].id);
    } catch (err) {
      console.error("Erreur de chargement des conversations :", err);
    }
  };

  // 🔹 Connexion WebSocket et notifications
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    connect(token, () => {
      conversations.forEach((conv) => {
        subscribe(conv.id, (msg) => {
          // Si message dans conv ouverte → ChatWindow gère
          if (conv.id === selectedConvId) return;

          // Sinon → marquer "unread"
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conv.id
                ? { ...c, unread: true, lastMessage: msg.content }
                : c
            )
          );
        });
      });
    });
  }, [conversations, selectedConvId]);

  // 🔹 Sélection d'une conversation
  const selectConversation = (id) => {
    setSelectedConvId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    );
  };

  // 🔹 Cliquer sur l'avatar d’un utilisateur → ouvrir ou créer une conversation
  const handleAvatarClick = async (user) => {
    try {
      const conv = await api.getOrCreateConversation(user.id);
      selectConversation(conv.id);
    } catch (err) {
      console.error("Erreur ouverture conversation :", err);
    }
  };

  // 🔹 Initialisation
  useEffect(() => {
    loadUser();
    loadPosts();
    loadConversations();
  }, []);

  // 🔹 Rendu
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* ---- FEED ---- */}
      <main className="flex-1 max-w-2xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow p-4">
          <CreatePostForm onPostCreated={loadPosts} />
        </div>

        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : posts.length === 0 ? (
          <p className="text-center">Aucun post</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow p-4">
              <PostCard post={post} />
            </div>
          ))
        )}
      </main>

      {/* ---- CHAT ---- */}
      <aside className="w-80 border-l bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">💬 Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ChatList
            conversations={conversations}
            selectedConvId={selectedConvId}
            onSelect={selectConversation}
            onAvatarClick={handleAvatarClick}
            currentUserId={currentUser?.id}
          />
        </div>

        <div className="border-t p-3 h-96 flex flex-col">
          {jwtToken && selectedConvId ? (
            <ChatWindow convId={selectedConvId} jwtToken={jwtToken} />
          ) : (
            <p className="text-center text-gray-500">
              Sélectionnez une conversation
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
