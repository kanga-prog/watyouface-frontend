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
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

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
        const error = await res.text();
        alert("Échec de la publication : " + error);
        return;
      }

      setContent("");
      removeFile();
      if (onPostCreated) onPostCreated();
    } catch (err) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
      <Textarea
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
                alt="preview"
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
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            className="hidden"
          />
        </label>

        <Button type="submit" disabled={isSubmitting || (!content.trim() && !file)}>
          {isSubmitting ? "Publication..." : "Publier"}
        </Button>
      </div>
    </form>
  );
}