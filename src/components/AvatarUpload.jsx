import React, { useState } from "react";
import { api } from "../utils/api";

export default function AvatarUpload({ onUpload }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const res = await api.uploadAvatar(file);
    const data = await res.json();
    if (res.ok) {
      alert("✅ Avatar mis à jour !");
      if (onUpload) onUpload(data.avatarUrl);
    } else {
      alert("❌ Erreur : " + data.message);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {preview && <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />}
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}
