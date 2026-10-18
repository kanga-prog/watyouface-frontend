import { useState, useRef } from "react";
import { api } from "../../utils/api";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { defaultAvatar } from "../../utils/media";

export default function CreatePostForm({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedImages = new Set(["image/jpeg", "image/png", "image/gif", "image/bmp"]);
    const allowedVideos = new Set(["video/mp4", "video/webm", "video/quicktime"]);
    if (!allowedImages.has(selectedFile.type) && !allowedVideos.has(selectedFile.type)) {
      setError("Formats acceptés : JPEG, PNG, GIF, BMP ou vidéo MP4/WebM/MOV.");
      e.target.value = "";
      return;
    }
    if ((allowedImages.has(selectedFile.type) && selectedFile.size > 10 * 1024 * 1024)
      || (allowedVideos.has(selectedFile.type) && selectedFile.size > 200 * 1024 * 1024)) {
      setError(allowedImages.has(selectedFile.type) ? "Image trop volumineuse : 10 Mo maximum." : "Vidéo trop volumineuse : 200 Mo maximum.");
      e.target.value = "";
      return;
    }
    setError("");

    const type =
      selectedFile.type.startsWith("image/") ? "image"
      : selectedFile.type.startsWith("video/") ? "video"
      : "other";

    // cleanup preview précédent
    if (preview && (fileType === "image" || fileType === "video")) {
      URL.revokeObjectURL(preview);
    }

    setFileType(type);
    setFile(selectedFile);

    if (type === "image" || type === "video") {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const removeFile = () => {
    if (preview && (fileType === "image" || fileType === "video")) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setFileType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    setIsSubmitting(true);

    const formData = new FormData();
    if (content) formData.append("content", content);
    if (file) formData.append("file", file);

    try {
      const res = await api.createPost(formData);

      if (!res.ok) {
        const message = await api.errorMessage(res);
        setError(message);
        return;
      }

      setContent("");
      removeFile();
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError(err?.message || "Erreur réseau lors de la publication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
      <label className="sr-only" htmlFor="post-content">Contenu de la publication</label>
      <Textarea
        id="post-content"
        placeholder="Quoi de neuf ?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />

      {file && (
        <div className="mt-3 relative w-full">
          {fileType === "image" && preview && (
            <div className="w-full overflow-hidden rounded-lg border">
              <img
                src={preview || defaultAvatar}
                alt="Aperçu du média image sélectionné"
                className="w-full max-h-64 object-contain"
              />
            </div>
          )}

          {fileType === "video" && preview && (
            <div className="w-full overflow-hidden rounded-lg border">
              <video
                src={preview}
                controls
                preload="metadata"
                className="w-full max-h-64 object-contain"
              />
            </div>
          )}

          {fileType === "other" && (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
              <span>📄</span>
              <span className="break-all">{file.name}</span>
            </div>
          )}

          <Button
            type="button"
            onClick={removeFile}
            aria-label="Retirer le fichier sélectionné"
            className="absolute -top-2 -right-2 rounded-full p-0.5 bg-red-500 text-white"
          >
            ✕
          </Button>
        </div>
      )}

      <div className="mt-3 flex justify-between items-center">
        <label className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-blue-600">
          <span>📷/📁</span>
          <span>Fichier</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/gif,image/bmp,video/mp4,video/webm,video/quicktime"
            className="hidden"
          />
        </label>

        <Button type="submit" disabled={isSubmitting || (!content.trim() && !file)}>
          {isSubmitting ? "Publication..." : "Publier"}
        </Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </form>
  );
}
