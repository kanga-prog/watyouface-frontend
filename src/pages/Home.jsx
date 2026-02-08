import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { mediaUrl, defaultAvatar } from "../utils/media";

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

  useEffect(() => {
    console.log("🟡 selectedConvId → UPDATED =", selectedConvId);
  }, [selectedConvId]);

  const loadUser = async () => {
    try {
      const data = await api.getProfile();
      setCurrentUser(data);
    } catch {
      navigate("/login");
    }
  };

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur conversations:", err);
      setConversations([]);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setAllUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement users:", err);
      setAllUsers([]);
    }
  };

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

  const getOrCreateConversation = async (userId) => {
    try {
      const conv = await api.getOrCreateConversation(userId);

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

  useEffect(() => {
    loadUser();
    loadUsers();
    loadPosts();
    loadConversations();
  }, []);

  return (
    <div className="pt-20 flex w-full h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR GAUCHE : Marketplace */}
      <aside className="w-96 h-full bg-white border-r flex flex-col">
        <div className="p-4 border-b font-bold shrink-0">🛒 Marketplace</div>
        <div className="flex-1 overflow-y-auto">
          <MarketplaceSidebar />
        </div>
      </aside>

      {/* CENTRE : FEED */}
      <main className="flex-1 h-full flex flex-col bg-gray-50">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <CreatePostForm onPostCreated={loadPosts} />
          {loading ? (
            <p className="text-center">Chargement...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500">Aucun post</p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </main>

      {/* SIDEBAR DROITE : Chat List + Chat Window */}
      <aside className="w-96 bg-white border-l flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h2 className="font-bold text-xl">💬 Chat WatYouFace 🎭</h2>
        </div>

        <div className="h-[200px] overflow-y-auto border-b">
          <ChatList
            conversations={conversations}
            users={allUsers}
            selectedConvId={selectedConvId}
            onSelect={setSelectedConvId}
            onAvatarClick={getOrCreateConversation}
            currentUserId={currentUser?.id}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {jwtToken && selectedConvId ? (
            <ChatWindow
              convId={selectedConvId}
              jwtToken={jwtToken}
              username={currentUser?.username}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p className="text-center p-4">Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
