import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { api } from "../../utils/api";
import { mediaUrl, defaultAvatar } from "../../utils/media";

export default function CommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await api.addComment(postId, content);
      setContent("");
      onCommentAdded();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex space-x-2">
      <Input
        placeholder="Écrire un commentaire..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={isSubmitting || !content.trim()}>
        Envoyer
      </Button>
    </form>
  );
}
