import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import PostCard from "../components/post/PostCard";
import CreatePostForm from "../components/post/CreatePostForm";
import { mediaUrl, defaultAvatar } from "../utils/media";

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await api.getMarketplacePosts();
      const data = await res.json();
      setListings(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error("Erreur marketplace :", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-4">
        <CreatePostForm onPostCreated={loadListings} marketplaceMode={true} />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Chargement des annonces...</p>
      ) : listings.length === 0 ? (
        <p className="text-center text-gray-400">Aucune annonce pour le moment</p>
      ) : (
        listings.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl shadow p-4">
            <PostCard post={post} marketplaceMode={true} />
          </div>
        ))
      )}
    </div>
  );
}
