// src/components/CreatePostForm.jsx
import { useState, useRef } from "react";
import { api } from "../utils/api";

export default function CreatePostForm({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Gestion du fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Vérifier le type
    if (!selectedFile.type.startsWith("image/") && !selectedFile.type.startsWith("video/")) {
      alert("Veuillez sélectionner une image ou une vidéo.");
      return;
    }

    setFile(selectedFile);

    // Créer un preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
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
      const token = api.getToken();
      const res = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ⚠️ Pas de Content-Type → le navigateur le définit avec boundary
        },
        body: formData,
      });

      if (res.ok) {
        setContent("");
        setFile(null);
        setPreview(null);
        onPostCreated();
      } else {
        const error = await res.text();
        console.error("Erreur backend:", error);
        alert("Échec de la publication");
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
      alert("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Quoi de neuf ?"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        rows="3"
      />

      {/* Preview */}
      {preview && (
        <div className="mt-3 relative inline-block">
          {file.type.startsWith("image/") ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 rounded-lg object-contain"
            />
          ) : (
            <video
              src={preview}
              controls
              className="max-h-64 rounded-lg"
            />
          )}
          <button
            type="button"
            onClick={removeFile}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mt-3 flex justify-between items-center">
        <label className="flex items-center space-x-2 text-gray-600 cursor-pointer hover:text-blue-600">
          <span>📷</span>
          <span>Image/vidéo</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting || (!content.trim() && !file)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Publication..." : "Publier"}
        </button>
      </div>
    </form>
  );
}