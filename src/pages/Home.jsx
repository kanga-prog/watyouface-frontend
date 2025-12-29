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
  const [allUsers, setAllUsers] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);

  const navigate = useNavigate();

  /* DEBUG selectedConvId */
  useEffect(() => {
    console.log("🟡 selectedConvId → UPDATED =", selectedConvId);
  }, [selectedConvId]);

  /* PROFIL */
  const loadUser = async () => {
    try {
      const data = await api.getProfile();
      setCurrentUser(data);
    } catch {
      navigate("/login");
    }
  };

  /* CONVERSATIONS */
  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur conversations:", err);
      setConversations([]);
    }
  };

  /* UTILISATEURS */
  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setAllUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement users:", err);
      setAllUsers([]);
    }
  };

  /* POSTS */
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

  /* CRÉER / RÉCUPÉRER CONVERSATION */
  const getOrCreateConversation = async (userId) => {
    try {
      const conv = await api.getOrCreateConversation(userId);
      console.log("Conversation trouvée ou créée →", conv);

      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conv.id);
        if (exists) return prev;
        return [conv, ...prev];
      });

      setSelectedConvId(conv.id);
      return conv;
    } catch (err) {
      console.error("Erreur getOrCreateConversation:", err);
    }
  };

  /* CHARGEMENT INITIAL */
  useEffect(() => {
    loadUser();
    loadUsers();
    loadPosts();
    loadConversations();
  }, []);

  return (
    <div className="pt-20 flex w-full min-h-screen bg-gray-50">

      {/* SIDEBAR GAUCHE */}
      <aside className="w-72 min-w-[18rem] bg-white border-r flex flex-col">
        <h2 className="font-bold text-xl p-4 border-b">💬 Chat</h2>
        <div className="flex-1 overflow-y-auto">
          <ChatList
            conversations={conversations}
            users={allUsers}
            selectedConvId={selectedConvId}
            onSelect={setSelectedConvId}
            onAvatarClick={getOrCreateConversation}
            currentUserId={currentUser?.id}
          />
        </div>
      </aside>

      {/* CENTRE CHAT + FEED */}
      <main className="flex-1 flex flex-col p-4 space-y-4">
        {/* Chat Window */}
        <div className="w-full bg-white border rounded-lg shadow-sm h-[400px] overflow-hidden">
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

        {/* Formulaire Post */}
        <CreatePostForm onPostCreated={loadPosts} />

        {/* Posts */}
        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">Aucun post</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </main>

      {/* SIDEBAR DROITE : Marketplace */}
      <aside className="w-96 bg-white border-l overflow-y-auto">
        <MarketplaceSidebar />
      </aside>
    </div>
  );
}
