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
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadPosts();
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* 🟢 Messagerie gauche */}
      <aside className="w-80 bg-white border-r flex flex-col">
        <h2 className="font-bold text-xl p-4 border-b">💬 Chat</h2>
        <div className="flex-1 overflow-y-auto">
          <ChatList
            conversations={conversations}
            users={allUsers}
            selectedConvId={selectedConvId}
            onSelect={(id) => setSelectedConvId(id)}
            onAvatarClick={() => {}}
            currentUserId={currentUser?.id}
          />
        </div>
        <div className="flex-1 flex flex-col bg-gray-50">
          {jwtToken && selectedConvId ? (
            <ChatWindow
              convId={selectedConvId}
              jwtToken={jwtToken}
              username={currentUser?.username}
            />
          ) : (
            <div className="flex items-center justify-center flex-1 text-gray-400">
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </aside>

      {/* 🟡 Feed central */}
      <main className="flex-1 max-w-2xl mx-auto p-4 space-y-4">
        <CreatePostForm onPostCreated={loadPosts} />
        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : posts.length === 0 ? (
          <p className="text-center">Aucun post</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </main>

      {/* 🔵 Marketplace droite */}
      <aside className="w-96 bg-white border-l">
        <MarketplaceSidebar />
      </aside>
    </div>
  );
}
