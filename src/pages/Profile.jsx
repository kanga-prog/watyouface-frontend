import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AvatarUpload from "../components/profile/AvatarUpload";
import { api } from "../utils/api";
import { mediaUrl, defaultAvatar } from "../utils/media";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activeContractId, setActiveContractId] = useState(null);
  const [loadingContract, setLoadingContract] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getProfile()
      .then((data) => {
        setUser(data);
        setNewUsername(data.username);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    api
      .getActiveContract()
      .then((res) => res.ok && res.json())
      .then((data) => data && setActiveContractId(data.id))
      .finally(() => setLoadingContract(false));
  }, [user]);

  const handleDownloadContract = async () => {
    setDownloading(true);
    try {
      const res = await api.downloadContract(activeContractId);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "WatYouFace_Contract.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    const res = await api.updateUsername(newUsername);
    if (res.ok) {
      setUser((u) => ({ ...u, username: newUsername }));
      setEditingUsername(false);
    }
  };

  const handleAvatarUpload = (avatarUrl) => {
    setUser((u) => ({ ...u, avatarUrl }));
    localStorage.setItem("avatarUrl", avatarUrl);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">
          👋 Bienvenue, {user.username}
        </h1>

        {/* Section Avatar + username */}
        <div className="bg-white p-6 rounded shadow flex gap-6">
          <AvatarUpload
            currentAvatarUrl={(user.avatarUrl ? mediaUrl(user.avatarUrl) : defaultAvatar) ? mediaUrl((user.avatarUrl ? mediaUrl(user.avatarUrl) : defaultAvatar)) : defaultAvatar}
            onUpload={handleAvatarUpload}
          />

          <div>
            {editingUsername ? (
              <div className="flex gap-2">
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="border px-2"
                />
                <button onClick={handleUsernameUpdate}>✅</button>
                <button onClick={() => setEditingUsername(false)}>❌</button>
              </div>
            ) : (
              <button
                onClick={() => setEditingUsername(true)}
                className="text-blue-600"
              >
                ✏️ Modifier
              </button>
            )}
            <p>{user.email}</p>
          </div>
        </div>

        {/* Contrat */}
        <div className="bg-white p-6 rounded shadow">
          {loadingContract ? (
            <p>Chargement du contrat…</p>
          ) : activeContractId ? (
            <button
              onClick={handleDownloadContract}
              disabled={downloading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              📄 Télécharger le contrat
            </button>
          ) : (
            <p className="text-red-600">Aucun contrat actif</p>
          )}
        </div>

        {/* Avatar central */}
        <div className="bg-white p-6 rounded shadow text-center">
          <Avatar className="w-16 h-16 mx-auto">
            <AvatarImage src={(user.avatarUrl ? mediaUrl(user.avatarUrl) : defaultAvatar) ? mediaUrl((user.avatarUrl ? mediaUrl(user.avatarUrl) : defaultAvatar)) : defaultAvatar} />
            <AvatarFallback>
              {user.username?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold mt-2">{user.username}</p>
        </div>
      </div>
    </div>
  );
}
