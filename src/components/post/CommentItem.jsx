import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media";

export default function CommentItem({ comment }) {
  const avatarUrl = (comment.authorAvatarUrl ? mediaUrl(comment.authorAvatarUrl) : defaultAvatar)
    ? mediaUrl((comment.authorAvatarUrl ? mediaUrl(comment.authorAvatarUrl) : defaultAvatar))
    : defaultAvatar;

  return (
    <div className="flex gap-2 py-2">
      <Avatar className="w-2 h-2">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          {comment.authorUsername?.[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div>
        <p className="text-xs font-medium">{comment.authorUsername}</p>
        <p className="text-sm text-gray-700">{comment.content}</p>
      </div>
    </div>
  );
}
