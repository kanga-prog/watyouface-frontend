import React, { useEffect, useRef, useState } from "react";
import { api } from "../../utils/api";
import { Button } from "../ui/button";
import { mediaUrl, defaultAvatar } from "../../utils/media";

export default function AvatarUpload({ onUpload, currentAvatarUrl }) {
  const [preview, setPreview] = useState(null); // peut être URL locale (blob:) ou URL backend (/media/..)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const localObjectUrlRef = useRef(null);

  // util : construit la src finale
  const avatarSrc = (url) => {
    if (!url) return defaultAvatar;
    // si c'est déjà une URL locale blob: (preview), on la renvoie telle quelle
    if (url.startsWith("blob:")) return url;
    // sinon c’est une URL backend du type /media/avatars/...
    return mediaUrl(url);
  };

  // sync preview avec avatar actuel (backend)
  useEffect(() => {
    setPreview(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  // cleanup ObjectURL à l’unmount
  useEffect(() => {
    return () => {
      if (localObjectUrlRef.current) {
        URL.revokeObjectURL(localObjectUrlRef.current);
        localObjectUrlRef.current = null;
      }
    };
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Format invalide (image uniquement)");
      return;
    }

    setError(null);

    // cleanup ancien objectURL
    if (localObjectUrlRef.current) {
      URL.revokeObjectURL(localObjectUrlRef.current);
      localObjectUrlRef.current = null;
    }

    // preview local immédiat
    const objectUrl = URL.createObjectURL(file);
    localObjectUrlRef.current = objectUrl;
    setPreview(objectUrl);

    setLoading(true);
    try {
      const res = await api.uploadAvatar(file);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Erreur upload");
      }

      // data.avatarUrl doit être "/media/avatars/...."
      onUpload?.(data.avatarUrl);

      // après succès, on affiche l’URL backend
      setPreview(data.avatarUrl);

      // on peut libérer l’objectURL (plus besoin)
      if (localObjectUrlRef.current) {
        URL.revokeObjectURL(localObjectUrlRef.current);
        localObjectUrlRef.current = null;
      }
    } catch (err) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);

      // reset input pour pouvoir re-uploader le même fichier
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar grand (profil) */}
      <div className="w-32 h-32 rounded-full overflow-hidden border bg-gray-100">
        <img
          src={avatarSrc(preview)}
          alt="avatar"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

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