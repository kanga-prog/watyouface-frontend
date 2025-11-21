// src/components/post/PostCard.jsx
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import LikeButton from "./LikeButton";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { api } from "../../utils/api";

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
        console.error(err);
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

  const buildMediaUrl = (path) => (path ? (path.startsWith("http") ? path : `http://localhost:8080${path}`) : null);

  const imageUrl = buildMediaUrl(post.imageUrl);
  const videoUrl = buildMediaUrl(post.videoUrl);
  const selfieUrl = buildMediaUrl(post.selfieUrl);
  const avatarUrl = buildMediaUrl(post.user?.avatarUrl) || "http://localhost:8080/uploads/avatars/default.png";

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4">
        <Avatar src={avatarUrl} alt={post.authorUsername} size={40} />
        <div>
          <p className="font-semibold">{post.authorUsername}</p>
          <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {post.content && <p className="mb-3 text-gray-800 whitespace-pre-line">{post.content}</p>}
        {imageUrl && <img src={imageUrl} alt="Post media" className="w-full max-h-96 object-contain rounded-lg" />}
        {videoUrl && <video src={videoUrl} controls className="w-full max-h-96 rounded-lg mt-3" />}
        {selfieUrl && !imageUrl && <img src={selfieUrl} alt="Selfie" className="w-32 h-32 rounded-full mx-auto border-4 border-blue-200 mt-3" />}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center px-4 py-2 border-t border-gray-100">
        <LikeButton postId={post.id} initialLikeCount={post.likeCount || 0} initialLiked={post.userHasLiked || false} />
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
            💬 {post.commentCount || 0}
          </Button>
          <Button variant="ghost" size="sm">
            🔄 {post.shareCount || 0}
          </Button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          {loadingComments ? (
            <div className="flex justify-center py-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {comments.length > 0 ? comments.map((comment) => <CommentItem key={comment.id} comment={comment} />) : <p className="text-gray-500 text-sm text-center py-2">Aucun commentaire</p>}
              <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
            </>
          )}
        </div>
      )}
    </Card>
  );
}
