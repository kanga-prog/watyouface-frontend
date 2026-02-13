import React, { useState, useEffect, useRef } from "react";
import { api } from "../../utils/api";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { mediaUrl, defaultAvatar } from "../../utils/media";

export default function AvatarUpload({ onUpload, currentAvatarUrl }) {
  const [preview, setPreview] = useState(currentAvatarUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(currentAvatarUrl);
  }, [currentAvatarUrl]);

  const avatarSrc = (url) => (url ? mediaUrl(url) : defaultAvatar);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Format invalide (image uniquement)");
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const res = await api.uploadAvatar(file);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erreur upload");

      onUpload?.(data.avatarUrl);
      setPreview(data.avatarUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar size="xl">
        <AvatarImage src={avatarSrc(preview)} />
        <AvatarFallback>👤</AvatarFallback>
      </Avatar>

      <Button
        size="sm"
        variant="outline"
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
      >
        {loading ? "Chargement…" : "Changer l’avatar"}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
