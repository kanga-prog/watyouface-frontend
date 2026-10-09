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
  const isAdmin = (user?.role ?? "USER").toString().toUpperCase().replace(/^ROLE_/, "") === "ADMIN";

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
    } catch {
      alert("Erreur lors du crédit du wallet de démonstration.");
    } finally {
      setRecharging(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6">

        {/* ===== HEADER PROFIL ===== */}
        <section className="flex min-w-0 flex-col items-stretch gap-4 rounded bg-white p-4 shadow sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="h-20 w-20 shrink-0 ring-4 ring-blue-500/20 sm:h-24 sm:w-24">
              <AvatarImage src={avatarSrc(user.avatarUrl)} />
              <AvatarFallback>
                {user.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="break-words text-2xl font-bold">{user.username}</h2>
              <p className="break-all text-sm text-gray-500">{user.email} <span className="sr-only">(donnée privée)</span></p>
            </div>
          </div>

          <div className="w-full min-w-0 sm:w-auto sm:shrink-0">
            <AvatarUpload
              currentAvatarUrl={user.avatarUrl}
              onUpload={handleAvatarUpload}
            />
          </div>
        </section>

        {/* ===== WALLET ===== */}
        <section className="min-w-0 space-y-3 rounded bg-white p-4 shadow sm:p-6">
          <h2 className="text-xl font-semibold">Wallet de démonstration</h2>
          <p>
            Solde : <span className="font-bold">{user.walletBalance ?? 0} crédits démo</span>
          </p>

          {isAdmin ? (
            <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="wallet-credit">Montant de crédit démo</label>
              <input
                id="wallet-credit"
                type="number"
                placeholder="Montant à créditer"
                className="min-w-0 flex-1 rounded border p-2"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
              />
              <Button onClick={handleRecharge} disabled={recharging}>
                {recharging ? "Crédit en cours…" : "Créditer (admin)"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Le crédit de démonstration est réservé à l’administration.</p>
          )}
        </section>

        {/* ===== IDENTITÉ ===== */}
        <section className="min-w-0 space-y-4 rounded bg-white p-4 shadow sm:p-6">
          <h2 className="text-xl font-semibold">👤 Identité</h2>

          {editingUsername ? (
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="min-w-0 rounded border px-2 py-1"
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
        <section className="min-w-0 space-y-3 rounded bg-white p-4 shadow sm:p-6">
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
