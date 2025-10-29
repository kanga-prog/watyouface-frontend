// src/components/PostCard.jsx
import { useState, useEffect } from "react";
import LikeButton from "./LikeButton";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { api } from "../utils/api";

export default function PostCard({ post }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const loadComments = async () => {
    if (showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await api.getComments(post.id);
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("Erreur chargement commentaires", err);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments]);

  const handleCommentAdded = () => {
    setComments([]);
    loadComments();
  };

  // Fonction utilitaire pour construire l'URL complète
  const buildMediaUrl = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `http://localhost:8080${path}`;
  };

  const imageUrl = buildMediaUrl(post.imageUrl);
  const videoUrl = buildMediaUrl(post.videoUrl);
  const selfieUrl = buildMediaUrl(post.selfieUrl);

  return (
    <div className="bg-white rounded-xl shadow mb-6 overflow-hidden">
      {/* En-tête */}
      <div className="p-4 flex items-center space-x-3">
        <div className="bg-blue-100 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center font-bold">
          {post.authorUsername?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{post.authorUsername}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="px-4 pb-3">
        {post.content && (
          <p className="text-gray-800 whitespace-pre-line mb-3">{post.content}</p>
        )}

        {/* Affichage de l'image */}
        {imageUrl && (
          <div className="relative group">
            <img
              src={imageUrl}
              alt="Post media"
              className="w-full max-h-96 object-contain rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Affichage de la vidéo */}
        {videoUrl && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <video
              src={videoUrl}
              controls
              className="w-full max-h-96"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </div>
        )}

        {/* Affichage du selfie (traité comme une image) */}
        {selfieUrl && !imageUrl && (
          <div className="relative mt-3">
            <img
              src={selfieUrl}
              alt="Selfie"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mx-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20"></div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-t border-gray-100 flex justify-between items-center">
        <LikeButton
          postId={post.id}
          initialLikeCount={post.likeCount || 0}
          initialLiked={post.userHasLiked || false}
        />
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition"
          >
            <span>💬</span>
            <span className="text-sm">{post.commentCount || 0}</span>
          </button>
          
          <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition">
            <span>🔄</span>
            <span className="text-sm">{post.shareCount || 0}</span>
          </button>
        </div>
      </div>

      {/* Commentaires */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          {loadingComments ? (
            <div className="flex justify-center py-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-2">Aucun commentaire</p>
              )}
              <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
            </>
          )}
        </div>
      )}
    </div>
  );
}