import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AvatarUpload from "../components/profile/AvatarUpload";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activeContractId, setActiveContractId] = useState(null);
  const [loadingContract, setLoadingContract] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const navigate = useNavigate();

  // 🧠 Charger le profil utilisateur
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:8080/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Non authentifié");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setNewUsername(data.username);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  // 📄 Charger le contrat actif
  useEffect(() => {
    if (!user) return;

    fetch("http://localhost:8080/api/contracts/active")
      .then((res) => {
        if (!res.ok) throw new Error("Pas de contrat actif");
        return res.json();
      })
      .then((data) => {
        setActiveContractId(data.id);
        setLoadingContract(false);
      })
      .catch(() => setLoadingContract(false));
  }, [user]);

  // 📥 Télécharger le contrat
  const handleDownloadContract = async () => {
    if (!activeContractId || !user) return;
    setDownloading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8080/api/contracts/${activeContractId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        alert("Erreur lors du téléchargement.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WatYouFace_Contract_v${activeContractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erreur :", err);
      alert("Une erreur est survenue.");
    } finally {
      setDownloading(false);
    }
  };

  // ✏️ Modifier le username
  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      alert("Le nom d’utilisateur ne peut pas être vide.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8080/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername }),
      });
      if (!response.ok) {
        alert("Erreur lors de la mise à jour du nom d’utilisateur.");
        return;
      }
      const data = await response.json();
      setUser((prev) => ({ ...prev, username: data.username }));
      setEditingUsername(false);
    } catch (err) {
      console.error(err);
      alert("Erreur serveur.");
    }
  };

  const handleAvatarUpload = (avatarUrl) => {
    setUser((prev) => ({ ...prev, avatarUrl }));
    localStorage.setItem("avatarUrl", avatarUrl);
  };

  if (!user)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );

  const capitalizedUsername =
    user.username.charAt(0).toUpperCase() + user.username.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            👋 Bienvenue, <span className="text-blue-600">{capitalizedUsername}</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez votre compte, votre image et vos documents légaux
          </p>
        </div>

        {/* Profil utilisateur */}
        <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-6">
          <AvatarUpload
            onUpload={handleAvatarUpload}
            currentAvatarUrl={user.avatarUrl}
          />
          <div className="flex flex-col space-y-2">
            {editingUsername ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="border rounded-md px-2 py-1"
                />
                <button
                  onClick={handleUsernameUpdate}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  ✅
                </button>
                <button
                  onClick={() => setEditingUsername(false)}
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                >
                  ❌
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {capitalizedUsername}
                </h2>
                <button
                  onClick={() => setEditingUsername(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ✏️ Modifier
                </button>
              </div>
            )}
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Contrat légal */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              📄 Contrat légal
            </h2>
            {activeContractId && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Actif
              </span>
            )}
          </div>

          {loadingContract ? (
            <p className="text-gray-500">Chargement du contrat...</p>
          ) : activeContractId ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                Vous avez accepté le contrat général de WatYouFace.
              </p>
              <button
                onClick={handleDownloadContract}
                disabled={downloading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  downloading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {downloading ? "Préparation..." : "📄 Télécharger le PDF"}
              </button>
            </div>
          ) : (
            <p className="text-red-600">Aucun contrat actif.</p>
          )}
        </div>

        {/* Vue publique */}
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            👀 Comment les autres te voient
          </h2>
          <div className="flex flex-col items-center space-y-3">
            <img
              src={user.avatarUrl ? `http://localhost:8080${user.avatarUrl}` : ""}
              alt="Avatar public"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) =>
                (e.target.src =
                  "http://localhost:8080/uploads/avatars/default.png")
              }
            />
            <p className="text-lg font-semibold text-gray-900">{capitalizedUsername}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              🟢 En ligne
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
