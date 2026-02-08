 import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import LikeButton from "./LikeButton";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { api } from "../../utils/api";
import { mediaUrl, defaultAvatar } from "../../utils/media";

export default function PostCard({ post }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const avatarUrl = post.user?.avatarUrl
    ? mediaUrl(post.user.avatarUrl)
    : defaultAvatar;

  useEffect(() => {
    if (!showComments || comments.length) return;

    setLoadingComments(true);
    api
      .getComments(post.id)
      .then((r) => r.json())
      .then(setComments)
      .finally(() => setLoadingComments(false));
  }, [showComments]);

  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 p-4">
        <Avatar className="w-2 h-2">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            {post.authorUsername?.[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="text-sm font-semibold">{post.authorUsername}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {post.content && (
        <div className="px-4 pb-3 text-gray-800">
          {post.content}
        </div>
      )}

      <div className="flex justify-between px-4 py-2 border-t">
        <LikeButton postId={post.id} initialLikeCount={post.likeCount} initialLiked={post.userHasLiked} />
        <Button size="sm" variant="ghost" onClick={() => setShowComments(!showComments)}>
          💬 {post.commentCount || 0}
        </Button>
      </div>

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
