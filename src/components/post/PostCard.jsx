import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import LikeButton from "./LikeButton";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { api } from "../../utils/api";
import { mediaUrl, defaultAvatar } from "../../utils/media";

// helper standard
const avatarSrc = (url) => (url ? mediaUrl(url) : defaultAvatar);

export default function PostCard({ post }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const avatarUrl = avatarSrc(post.author?.avatarUrl);

  useEffect(() => {
    if (!showComments || comments.length) return;

    setLoadingComments(true);
    api
      .getComments(post.id)
      .then((r) => r.json())
      .then(setComments)
      .finally(() => setLoadingComments(false));
  }, [showComments, post.id, comments.length]);

  return (
    <Card className="mb-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4">
        <Avatar size="xs">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            {post.author?.username?.[0]?.toUpperCase() || "👤"}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="text-sm font-semibold">{post.author?.username}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* TEXTE */}
      {post.content && <div className="px-4 pb-2 text-gray-800">{post.content}</div>}

      {/* IMAGE */}
      {post.imageUrl && (
        <img
          src={mediaUrl(post.imageUrl)}
          alt="post"
          className="w-full max-h-[500px] object-cover rounded"
        />
      )}

      {/* VIDEO ✅ */}
      {post.videoUrl && (
        <div className="w-full overflow-hidden rounded">
          <video
            src={mediaUrl(post.videoUrl)}
            controls
            preload="metadata"
            className="w-full max-h-[500px] object-contain"
          />
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between px-4 py-2 border-t">
        <LikeButton
          postId={post.id}
          initialLikeCount={post.likeCount}
          initialLiked={post.userHasLiked}
        />
        <Button size="sm" variant="ghost" onClick={() => setShowComments(!showComments)}>
          💬 {post.commentCount || 0}
        </Button>
      </div>

      {/* COMMENTAIRES */}
      {showComments && (
        <div className="px-4 py-3 bg-gray-50 border-t">
          {loadingComments ? (
            <p className="text-sm text-gray-400 text-center">Chargement…</p>
          ) : (
            <>
              {comments.map((c) => (
                <CommentItem key={c.id} comment={c} />
              ))}
              <CommentForm postId={post.id} />
            </>
          )}
        </div>
      )}
    </Card>
  );
}