// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/PostCard";
import { api } from "../utils/api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // 🔁 Redirige si pas de token
      return;
    }

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

  // ✅ Le return doit être DANS la fonction Home
  return (
    <div className="max-w-2xl mx-auto p-4">
      <CreatePostForm onPostCreated={loadPosts} />
      
      {loading ? (
        <p className="text-center text-gray-500">Chargement du fil...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">Aucun post pour le moment.</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}