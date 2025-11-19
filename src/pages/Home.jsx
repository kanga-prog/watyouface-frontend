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
  const [allUsers, setAllUsers] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);

  const navigate = useNavigate();

  const loadUser = async () => {
    try {
      const data = await api.getProfile();
      setCurrentUser(data);
    } catch (err) {
      console.warn("Erreur profil :", err);
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
      console.error("Erreur posts:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      const convArray = Array.isArray(data) ? data : [];
      setConversations(convArray.map((c) => ({ ...c, unread: false })));
      if (convArray.length > 0) setSelectedConvId(convArray[0].id);
    } catch (err) {
      console.error("Erreur conv:", err);
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await api.getUsers();
      setAllUsers(users.filter((u) => u.id !== currentUser?.id));
    } catch (err) {
      console.error("Erreur users:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    connect(token, () => console.log("✅ WS connecté"));
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;
    conversations.forEach((conv) => {
      subscribe(conv.id, (msg) => {
        if (conv.id === selectedConvId) return;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conv.id
              ? { ...c, unread: true, lastMessage: msg.content }
              : c
          )
        );
      });
    });
  }, [conversations, selectedConvId]);

  const selectConversation = (id) => {
    setSelectedConvId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    );
  };

  const handleAvatarClick = async (user) => {
    try {
      const conv = await api.getOrCreateConversation(user.id);
      await loadConversations();
      selectConversation(conv.id);
    } catch (err) {
      console.error("Erreur ouverture conv:", err);
    }
  };

  useEffect(() => {
    loadUser();
    loadPosts();
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentUser) loadAllUsers();
  }, [currentUser]);

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

      <aside className="w-96 bg-white border-l flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-xl text-gray-700">💬 Chat</h2>
        </div>

        <div className="h-64 overflow-y-auto border-b">
          <ChatList
            conversations={conversations}
            users={allUsers}
            selectedConvId={selectedConvId}
            onSelect={selectConversation}
            onAvatarClick={handleAvatarClick}
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
    </div>
  );
}
