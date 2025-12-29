import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

import CreatePostForm from "../components/post/CreatePostForm";
import PostCard from "../components/post/PostCard";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import MarketplaceSidebar from "../components/marketplace/MarketplaceSidebar";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // <- ici
  const [selectedConvId, setSelectedConvId] = useState(null);

  const navigate = useNavigate();

  // ---------------------------------------------
  // Créer ou récupérer une conversation
  // ---------------------------------------------
  async function getOrCreateConversation(userId) {
    try {
      const conv = await api.getOrCreateConversation(userId);
      console.log("Conversation trouvée ou créée →", conv);
      setSelectedConvId(conv.id);
      return conv;
    } catch (err) {
      console.error("Erreur dans getOrCreateConversation:", err);
    }
  }


  // ---------------------------------------------
  // LOG selectedConvId
  // ---------------------------------------------
  useEffect(() => {
    console.log("🟡 selectedConvId → UPDATED =", selectedConvId);
  }, [selectedConvId]);

  // ---------------------------------------------
  // Charger profil
  // ---------------------------------------------
  const loadUser = async () => {
    try {
      const data = await api.getProfile();
      setCurrentUser(data);
    } catch {
      navigate("/login");
    }
  };

  // ---------------------------------------------
  // Charger conversations
  // ---------------------------------------------
  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data.content || []);
    } catch (err) {
      console.error("Erreur conversations:", err);
      setConversations([]);
    }
  };

  // ---------------------------------------------
  // Charger utilisateurs
  // ---------------------------------------------
  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setAllUsers(data); // <- ici
    } catch (err) {
      console.error("Erreur chargement users:", err);
      setAllUsers([]);
    }
  };

  // ---------------------------------------------
  // Charger posts
  // ---------------------------------------------
  const loadPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    setJwtToken(token);

    try {
      const res = await api.getPosts();
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // Chargement initial
  // ---------------------------------------------
  useEffect(() => {
    loadUser();
    loadUsers();
    loadPosts();
    loadConversations();
  }, []);

  return (
    <div className="pt-20 flex w-full min-h-screen bg-gray-50">

      {/* 🟢 COLONNE GAUCHE : CHAT LIST */}
      <aside className="w-72 bg-white border-r flex flex-col overflow-hidden">
        <h2 className="font-bold text-xl p-4 border-b">💬 Chat</h2>

        <div className="flex-1 overflow-y-auto">
          <ChatList
            conversations={conversations}
            users={allUsers} // <- corrigé
            selectedConvId={selectedConvId}
            onSelect={setSelectedConvId}
            onAvatarClick={getOrCreateConversation}
            currentUserId={currentUser?.id}
          />
        </div>
      </aside>

      {/* 🟡 CENTRE : CHAT WINDOW + FEED */}
      <main className="flex-1 flex flex-col p-4 space-y-4 max-w-3xl mx-auto">

        {/* CHATWINDOW */}
        <div className="w-full bg-white border rounded-lg shadow-sm h-[350px] overflow-hidden">
          {jwtToken && selectedConvId ? (
            <ChatWindow
              convId={selectedConvId}
              jwtToken={jwtToken}
              username={currentUser?.username}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Sélectionnez une conversation
            </div>
          )}
        </div>

        {/* FORMULAIRE POST */}
        <CreatePostForm onPostCreated={loadPosts} />

        {/* POSTS */}
        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">Aucun post</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </main>

      {/* 🔵 COLONNE DROITE : MARKETPLACE */}
      <aside className="w-96 bg-white border-l overflow-y-auto">
        <MarketplaceSidebar />
      </aside>
    </div>
  );
}
