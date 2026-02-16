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

  /* ===== LOADERS ===== */
  const loadUser = async () => {
    try {
      const data = await api.getProfile();
      setCurrentUser(data);
    } catch {
      navigate("/login");
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
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      setConversations([]);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setAllUsers(Array.isArray(data) ? data : []);
    } catch {
      setAllUsers([]);
    }
  };

  const getOrCreateConversation = async (userId) => {
    const conv = await api.getOrCreateConversation(userId);

    setConversations((prev) => {
      const exists = prev.some((c) => c.id === conv.id);
      return exists ? prev : [conv, ...prev];
    });

    setSelectedConvId(conv.id);
  };

  useEffect(() => {
    loadUser();
    loadUsers();
    loadPosts();
    loadConversations();
  }, []);

  return (
    <div className="pt-20 flex w-full h-screen bg-gray-50 overflow-hidden">
      <aside className="w-96 bg-white border-r flex flex-col">
        <div className="p-4 border-b font-bold shrink-0"></div>

        <div className="flex-1 overflow-y-auto">
          <MarketplaceSidebar
            currentUser={currentUser}
            refreshUser={loadUser} // ✅ important (wallet refresh après PAID)
            onOpenChat={async (conversationId) => {
              setSelectedConvId(conversationId);
              await loadConversations(); // ✅ pour que ChatList voie la conv
            }}
          />
        </div>
      </aside>

      {/* 📰 FEED */}
      <main className="flex-1 flex flex-col bg-gray-50">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <CreatePostForm onPostCreated={loadPosts} />

          {loading ? (
            <p className="text-center">Chargement…</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500">Aucun post</p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </main>

      {/* 💬 CHAT */}
      <aside className="w-96 bg-white border-l flex flex-col h-full">
        <div className="p-4 border-b font-bold shrink-0">💬 Chat</div>

        <div className="flex-[1] overflow-y-auto border-b">
          <ChatList
            conversations={conversations}
            users={allUsers}
            selectedConvId={selectedConvId}
            onSelect={setSelectedConvId}
            onAvatarClick={getOrCreateConversation}
            currentUserId={currentUser?.id}
          />
        </div>

        <div className="flex-[2] flex flex-col bg-gray-50">
          {selectedConvId && jwtToken ? (
            <ChatWindow
              convId={selectedConvId}
              jwtToken={jwtToken}
              username={currentUser?.username}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
