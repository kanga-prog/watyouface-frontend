// src/pages/Home.jsx
import { useState, useEffect } from "react";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/PostCard";
import { api } from "../utils/api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const res = await api.getPosts();
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Erreur chargement posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

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