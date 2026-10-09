import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { api } from "../../utils/api";

export default function CommentForm({ postId, onCommentAdded }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await api.addComment(postId, content);
      setContent("");
      onCommentAdded?.();
    } catch {
      setError("Impossible d’ajouter le commentaire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2">
      <label className="sr-only" htmlFor={`comment-${postId}`}>Écrire un commentaire</label>
      <Input
        id={`comment-${postId}`}
        placeholder="Écrire un commentaire..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={isSubmitting || !content.trim()}>
        Envoyer
      </Button>
      {error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}
    </form>
  );
}
