import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AvatarUpload from "../components/profile/AvatarUpload";
import { api } from "../utils/api";
import { mediaUrl, defaultAvatar } from "../utils/media";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";

export default function Profile() {
  const [user, setUser] = useState(null);

  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  // NB: Le backend actuel ne gère pas bio/github/linkedin.

  const [activeContractId, setActiveContractId] = useState(null);
  const [loadingContract, setLoadingContract] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [saving, setSaving] = useState(false);

  // ==== WALLET ====
  const [walletAmount, setWalletAmount] = useState("");
  const [recharging, setRecharging] = useState(false);

  const navigate = useNavigate();

  const avatarSrc = (url) => (url ? mediaUrl(url) : defaultAvatar);

  /* ===== LOAD PROFILE ===== */
  useEffect(() => {
    api
      .getProfile()
      .then((data) => {
        setUser(data);
        setNewUsername(data.username);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  /* ===== CONTRACT ===== */
  useEffect(() => {
    if (!user) return;
    api
      .getActiveContract()
      .then((res) => res.ok && res.json())
      .then((data) => data && setActiveContractId(data.id))
      .finally(() => setLoadingContract(false));
  }, [user]);

  /* ===== ACTIONS ===== */

  const handleUsernameUpdate = async () => {
    setSaving(true);
    const res = await api.updateUsername(newUsername);
    if (res.ok) {
      setUser((u) => ({ ...u, username: newUsername }));
      setEditingUsername(false);
    }
    setSaving(false);
  };

  // Pas d'update bio/links pour l'instant.

  const handleAvatarUpload = (avatarUrl) => {
    setUser((u) => ({ ...u, avatarUrl }));
    localStorage.setItem("avatarUrl", avatarUrl);
  };

  const handleDownloadContract = async () => {
    setDownloading(true);
    const res = await api.downloadContract(activeContractId);
    const blob = await res.blob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "WatYouFace_Contract.pdf";
    a.click();

    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  /* ===== WALLET ===== */
  const handleRecharge = async () => {
    if (!walletAmount || Number(walletAmount) <= 0) return;
    setRecharging(true);
    try {
      await api.creditMyWallet(Number(walletAmount));
      setWalletAmount("");
      // reload user to update wallet balance (walletBalance renvoyé par /users/me)
      const updatedUser = await api.getProfile();
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du rechargement du wallet.");
    } finally {
      setRecharging(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ===== HEADER PROFIL ===== */}
        <section className="bg-white p-6 rounded shadow flex gap-6 items-center">
          <Avatar className="w-24 h-24 ring-4 ring-blue-500/20">
            <AvatarImage src={avatarSrc(user.avatarUrl)} />
            <AvatarFallback>
              {user.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <AvatarUpload
            currentAvatarUrl={user.avatarUrl}
            onUpload={handleAvatarUpload}
          />
        </section>

        {/* ===== WALLET ===== */}
        <section className="bg-white p-6 rounded shadow space-y-3">
          <h2 className="text-xl font-semibold">💰 Wallet</h2>
          <p>
            Solde : <span className="font-bold">{user.walletBalance ?? 0} WUF</span>
          </p>

          <div className="flex gap-2 mt-2">
            <input
              type="number"
              placeholder="Montant à recharger"
              className="border p-2 rounded flex-1"
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
            />
            <Button onClick={handleRecharge} disabled={recharging}>
              {recharging ? "Rechargement..." : "Recharger"}
            </Button>
          </div>
        </section>

        {/* ===== IDENTITÉ ===== */}
        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">👤 Identité</h2>

          {editingUsername ? (
            <div className="flex gap-2">
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <Button size="sm" onClick={handleUsernameUpdate} disabled={saving}>
                💾
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)}>
                ❌
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingUsername(true)}
            >
              ✏️ Modifier le pseudo
            </Button>
          )}
        </section>

        {/* ===== DOCUMENTS ===== */}
        <section className="bg-white p-6 rounded shadow space-y-3">
          <h2 className="text-xl font-semibold">📄 Documents</h2>

          {loadingContract ? (
            <p>Chargement…</p>
          ) : activeContractId ? (
            <Button onClick={handleDownloadContract} disabled={downloading}>
              📥 Télécharger le contrat
            </Button>
          ) : (
            <p className="text-red-600">Aucun contrat actif</p>
          )}
        </section>

      </div>
    </div>
  );
}
