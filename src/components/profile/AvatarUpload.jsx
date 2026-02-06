import React, { useState } from "react"; 
import { api } from "../../utils/api";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

export default function AvatarUpload({ onUpload, currentAvatarUrl }) {
  const [preview, setPreview] = useState(currentAvatarUrl || null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const res = await api.uploadAvatar(file);
      const data = await res.json();
      if (res.ok) {
        alert("✅ Avatar mis à jour !");
        onUpload?.(data.avatarUrl);
      } else alert("❌ Erreur : " + data.message);
    } catch (err) {
      console.error(err);
      alert("❌ Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <Avatar size="xs">
        <AvatarImage src={preview || "http://localhost:8080/uploads/avatars/default.png"} />
        <AvatarFallback>👤</AvatarFallback>
      </Avatar>

      <label>
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? "Chargement..." : "Changer l'avatar"}
        </Button>
      </label>
    </div>
  );
}
