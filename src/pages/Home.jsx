import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

import CreatePostForm from "../components/post/CreatePostForm";
import PostCard from "../components/post/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

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
    setLoading(true);
    setError(null);

    try {
      const res = await api.getPosts();
      if (!res.ok) throw new Error(`Impossible de charger le fil (${res.status})`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : data.content || []);
    } catch {
      setPosts([]);
      setError("Le fil d’actualité est indisponible. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadPosts();
    // Functions are intentionally initialized once when the page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] px-3 py-5 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Fil d’actualité</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Partagez et échangez avec la communauté.</p>
          </div>
          <button type="button" onClick={loadPosts} className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-white" disabled={loading}>
            Actualiser
          </button>
        </header>

        <CreatePostForm onPostCreated={loadPosts} />

        {loading ? (
          <p role="status" className="rounded-lg bg-white p-6 text-center text-[var(--color-text-secondary)]">Chargement du fil d’actualité…</p>
        ) : error ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p>{error}</p>
            <button type="button" onClick={loadPosts} className="mt-2 underline">Réessayer</button>
          </div>
        ) : posts.length === 0 ? (
          <p className="rounded-lg bg-white p-6 text-center text-[var(--color-text-secondary)]">Aucune publication pour le moment.</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} onChanged={loadPosts} />
          ))
        )}
      </div>
    </main>
  );
}
