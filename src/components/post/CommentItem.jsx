// src/components/post/CommentItem.jsx
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function CommentItem({ comment }) {
  const avatarUrl = comment.authorAvatarUrl
    ? `http://localhost:8080${comment.authorAvatarUrl}`
    : null;

  return (
    <div className="flex space-x-3 py-2">
      <Avatar className="w-8 h-8 flex-shrink-0">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={comment.authorUsername} />
        ) : (
          <AvatarFallback>{comment.authorUsername?.charAt(0).toUpperCase()}</AvatarFallback>
        )}
      </Avatar>

      <div>
        <p className="font-medium text-sm">{comment.authorUsername}</p>
        <p className="text-gray-700 text-sm">{comment.content}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(comment.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
