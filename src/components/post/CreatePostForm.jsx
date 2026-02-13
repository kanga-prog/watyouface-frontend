import { useState, useRef } from "react";
import { api } from "../../utils/api";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media";

export default function CreatePostForm({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(""); // "image", "video", "other"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Déterminer le type de fichier
    if (selectedFile.type.startsWith("image/")) setFileType("image");
    else if (selectedFile.type.startsWith("video/")) setFileType("video");
    else setFileType("other");

    setFile(selectedFile);

    // Prévisualisation uniquement pour image et vidéo
    if (fileType === "image" || fileType === "video") {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const removeFile = () => {
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

      // Reset
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
        <div className="mt-3 relative inline-block">
          {fileType === "image" && preview && (
            <Avatar size="md">
              <AvatarImage src={preview || defaultAvatar} />
              <AvatarFallback>👤</AvatarFallback>
            </Avatar>
          )}

          {fileType === "video" && preview && (
            <video src={preview} controls className="max-h-64 rounded-lg" />
          )}

          {fileType === "other" && (
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded">
              <span>📄</span>
              <span>{file.name}</span>
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
