import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media";

const avatarSrc = (url) => (url ? mediaUrl(url) : defaultAvatar);

export default function CommentItem({ comment }) {
  return (
    <div className="flex gap-2 py-2">
      <Avatar size="sm">
        <AvatarImage src={avatarSrc(comment.author?.avatarUrl)} />
        <AvatarFallback>
          {comment.author?.username?.[0]?.toUpperCase() || "👤"}
        </AvatarFallback>
      </Avatar>

      <div>
        <p className="text-xs font-medium">
          {comment.author?.username}
        </p>
        <p className="text-sm text-gray-700">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
