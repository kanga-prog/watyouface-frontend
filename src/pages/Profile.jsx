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
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailProof, setEmailProof] = useState("");
  const [emailCodeExpiresAt, setEmailCodeExpiresAt] = useState("");
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordCode, setPasswordCode] = useState("");
  const [passwordProof, setPasswordProof] = useState("");
  const [passwordCodeExpiresAt, setPasswordCodeExpiresAt] = useState("");
  const [passwordResendCooldown, setPasswordResendCooldown] = useState(0);

  // NB: Le backend actuel ne gère pas bio/github/linkedin.

  const [activeContractId, setActiveContractId] = useState(null);
  const [loadingContract, setLoadingContract] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const [saving, setSaving] = useState(false);
  const [showDeletionConfirm, setShowDeletionConfirm] = useState(false);
  const [deletionPhrase, setDeletionPhrase] = useState("");
  const [deletionError, setDeletionError] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => {
    if (emailResendCooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setEmailResendCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [emailResendCooldown]);

  useEffect(() => {
    if (passwordResendCooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setPasswordResendCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [passwordResendCooldown]);

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

  const handleEmailUpdate = async (event) => {
    event.preventDefault();
    setEmailSaving(true);
    setEmailError("");
    setEmailSuccess("");
    try {
      if (!emailCodeExpiresAt) {
        const response = await api.requestStepUp("EMAIL_CHANGE", emailCurrentPassword);
        if (!response.ok) throw new Error(await api.errorMessage(response));
        const data = await response.json();
        setEmailCodeExpiresAt(data.expiresAt);
        setEmailResendCooldown(30);
        setEmailSuccess("Code envoyé à l’adresse e-mail actuellement enregistrée.");
        return;
      }
      if (!emailProof) {
        const response = await api.verifyStepUp("EMAIL_CHANGE", emailCode);
        if (!response.ok) throw new Error(await api.errorMessage(response));
        const data = await response.json();
        setEmailProof(data.stepUpToken);
        setEmailSuccess("Code vérifié. Vous pouvez confirmer le changement.");
        return;
      }
      const response = await api.changeOwnEmail({
        newEmail: newEmail.trim(),
        currentPassword: emailCurrentPassword,
        stepUpToken: emailProof,
      });
      if (!response.ok) throw new Error(await api.errorMessage(response));
      const updated = await response.json();
      setUser((value) => ({ ...value, email: updated.email }));
      setEmailCurrentPassword("");
      setEmailCode("");
      setEmailProof("");
      setEmailCodeExpiresAt("");
      setNewEmail("");
      setEditingEmail(false);
      setEmailSuccess("Votre adresse e-mail a été modifiée.");
    } catch (error) {
      setEmailError(error?.message || "La modification de l’adresse e-mail a échoué.");
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordError("");
    try {
      if (!passwordCodeExpiresAt) {
        const response = await api.requestStepUp("PASSWORD_CHANGE", currentPassword);
        if (!response.ok) throw new Error(await api.errorMessage(response));
        const data = await response.json();
        setPasswordCodeExpiresAt(data.expiresAt);
        setPasswordResendCooldown(30);
        return;
      }
      if (!passwordProof) {
        const response = await api.verifyStepUp("PASSWORD_CHANGE", passwordCode);
        if (!response.ok) throw new Error(await api.errorMessage(response));
        const data = await response.json();
        setPasswordProof(data.stepUpToken);
        return;
      }
      const response = await api.changeOwnPassword({
        currentPassword,
        newPassword,
        confirmPassword,
        stepUpToken: passwordProof,
      });
      if (!response.ok) throw new Error(await api.errorMessage(response));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordCode("");
      setPasswordProof("");
      setPasswordCodeExpiresAt("");
      localStorage.removeItem("username");
      localStorage.removeItem("avatarUrl");
      window.dispatchEvent(new Event("watyouface:auth-change"));
      navigate("/login", { state: { message: "Mot de passe modifié. Connectez-vous à nouveau avec votre nouveau mot de passe." } });
    } catch (error) {
      setPasswordError(error?.message || "La modification du mot de passe a échoué.");
    } finally {
      setPasswordSaving(false);
    }
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

  const handleDataExport = async () => {
    setExporting(true);
    setExportError("");
    try {
      const response = await api.exportMyData();
      if (!response.ok) throw new Error(await api.errorMessage(response));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `watyouface-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error?.message || "Le téléchargement de vos données a échoué. Réessayez plus tard.");
    } finally {
      setExporting(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deletionPhrase !== "SUPPRIMER") return;
    setDeleting(true);
    setDeletionError("");
    try {
      const response = await api.deleteOwnAccount(user.id);
      if (!response.ok) throw new Error(await api.errorMessage(response));
      localStorage.removeItem("username");
      localStorage.removeItem("avatarUrl");
      window.dispatchEvent(new Event("watyouface:auth-change"));
      navigate("/login", { state: { message: "Votre compte a été effacé." } });
    } catch {
      setDeletionError("La suppression du compte a échoué. Réessayez plus tard.");
    } finally {
      setDeleting(false);
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
              <AvatarImage src={avatarSrc(user.avatarUrl)} alt={`Avatar de ${user.username}`} />
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

          <p className="text-sm text-gray-600">Le crédit de démonstration est réservé au tableau de bord d’administration.</p>
        </section>

        {/* ===== IDENTITÉ ===== */}
        <section className="min-w-0 space-y-4 rounded bg-white p-4 shadow sm:p-6">
          <h2 className="text-xl font-semibold">👤 Identité</h2>

          {editingUsername ? (
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="profile-username">Nouveau pseudo</label>
              <input
                id="profile-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="min-w-0 rounded border px-2 py-1"
              />
              <Button size="sm" onClick={handleUsernameUpdate} disabled={saving} aria-label="Enregistrer le nouveau pseudo">
                💾
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)} aria-label="Annuler la modification du pseudo">
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

        <section className="min-w-0 space-y-5 rounded bg-white p-4 shadow sm:p-6" aria-labelledby="account-security-title">
          <h2 id="account-security-title" className="text-xl font-semibold">Sécurité et coordonnées du compte</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">Adresse e-mail actuelle : <span className="font-medium">{user.email}</span></p>
            {!editingEmail ? (
              <Button type="button" variant="outline" onClick={() => { setEditingEmail(true); setEmailError(""); setEmailSuccess(""); setEmailCodeExpiresAt(""); setEmailProof(""); }}>
                Modifier mon e-mail
              </Button>
            ) : (
              <form onSubmit={handleEmailUpdate} className="max-w-lg space-y-3" aria-label="Modifier mon e-mail">
                <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="profile-new-email">Nouvel e-mail
                  <input id="profile-new-email" name="newEmail" type="email" required maxLength={255} autoComplete="email" value={newEmail} onChange={(event) => { setNewEmail(event.target.value); setEmailProof(""); }} className="rounded border px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="profile-email-current-password">Mot de passe actuel
                  <input id="profile-email-current-password" name="currentPassword" type="password" required maxLength={128} autoComplete="current-password" value={emailCurrentPassword} onChange={(event) => setEmailCurrentPassword(event.target.value)} className="rounded border px-3 py-2" />
                </label>
                {emailCodeExpiresAt && <>
                  <p role="status" className="text-sm text-gray-700">Code envoyé à l’adresse actuelle. Expiration : {new Date(emailCodeExpiresAt).toLocaleTimeString()}.</p>
                  {!emailProof && <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="profile-email-step-up-code">Code de vérification (6 chiffres)
                    <input id="profile-email-step-up-code" name="stepUpCode" type="text" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={emailCode} onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="rounded border px-3 py-2" />
                  </label>}
                  {emailProof && <p role="status" className="text-sm text-green-700">Vérification renforcée validée.</p>}
                </>}
                {emailError && <p role="alert" className="text-sm text-red-700">{emailError}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={emailSaving}>{emailSaving ? "Vérification…" : !emailCodeExpiresAt ? "Envoyer le code" : !emailProof ? "Vérifier le code" : "Confirmer le changement d’e-mail"}</Button>
                  {emailCodeExpiresAt && !emailProof && <Button type="button" variant="outline" disabled={emailSaving || emailResendCooldown > 0} onClick={async () => {
                    setEmailSaving(true); setEmailError(""); setEmailSuccess("");
                    try {
                      const response = await api.requestStepUp("EMAIL_CHANGE", emailCurrentPassword);
                      if (!response.ok) throw new Error(await api.errorMessage(response));
                      const data = await response.json(); setEmailCodeExpiresAt(data.expiresAt); setEmailCode(""); setEmailProof(""); setEmailResendCooldown(30);
                      setEmailSuccess("Un nouveau code a été envoyé à l’adresse actuelle.");
                    } catch (error) { setEmailError(error?.message || "La demande de code a échoué."); }
                    finally { setEmailSaving(false); }
                  }}>{emailResendCooldown ? `Renvoyer dans ${emailResendCooldown} s` : "Renvoyer un code"}</Button>}
                  <Button type="button" variant="outline" onClick={() => { setEditingEmail(false); setNewEmail(""); setEmailCurrentPassword(""); setEmailCode(""); setEmailProof(""); setEmailCodeExpiresAt(""); setEmailError(""); }} disabled={emailSaving}>Annuler</Button>
                </div>
              </form>
            )}
            {emailSuccess && <p role="status" className="text-sm text-green-700">{emailSuccess}</p>}
          </div>

          <div className="space-y-3 border-t pt-4">
            {!editingPassword ? (
              <Button type="button" variant="outline" onClick={() => { setEditingPassword(true); setPasswordError(""); setPasswordCodeExpiresAt(""); setPasswordProof(""); }}>
                Modifier mon mot de passe
              </Button>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="max-w-lg space-y-3" aria-label="Modifier mon mot de passe">
                <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="profile-current-password">Mot de passe actuel
                  <input id="profile-current-password" name="currentPassword" type="password" required maxLength={128} autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="rounded border px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="profile-new-password">Nouveau mot de passe (12 à 128 caractères)
                  <input id="profile-new-password" name="newPassword" type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="rounded border px-3 py-2" />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="profile-confirm-password">Confirmer le nouveau mot de passe
                  <input id="profile-confirm-password" name="confirmPassword" type="password" required maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="rounded border px-3 py-2" />
                </label>
                {passwordCodeExpiresAt && <>
                  <p role="status" className="text-sm text-gray-700">Code envoyé à l’adresse e-mail actuelle. Expiration : {new Date(passwordCodeExpiresAt).toLocaleTimeString()}.</p>
                  {!passwordProof && <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="profile-password-step-up-code">Code de vérification (6 chiffres)
                    <input id="profile-password-step-up-code" name="stepUpCode" type="text" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={passwordCode} onChange={(event) => setPasswordCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="rounded border px-3 py-2" />
                  </label>}
                  {passwordProof && <p role="status" className="text-sm text-green-700">Vérification renforcée validée.</p>}
                </>}
                <p className="text-xs text-gray-600">Après modification, cette session sera fermée. Les autres jetons déjà copiés peuvent rester valides jusqu’à leur expiration (24 h maximum).</p>
                {passwordError && <p role="alert" className="text-sm text-red-700">{passwordError}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={passwordSaving}>{passwordSaving ? "Vérification…" : !passwordCodeExpiresAt ? "Envoyer le code" : !passwordProof ? "Vérifier le code" : "Confirmer le changement de mot de passe"}</Button>
                  {passwordCodeExpiresAt && !passwordProof && <Button type="button" variant="outline" disabled={passwordSaving || passwordResendCooldown > 0} onClick={async () => {
                    setPasswordSaving(true); setPasswordError("");
                    try {
                      const response = await api.requestStepUp("PASSWORD_CHANGE", currentPassword);
                      if (!response.ok) throw new Error(await api.errorMessage(response));
                      const data = await response.json(); setPasswordCodeExpiresAt(data.expiresAt); setPasswordCode(""); setPasswordProof(""); setPasswordResendCooldown(30);
                    } catch (error) { setPasswordError(error?.message || "La demande de code a échoué."); }
                    finally { setPasswordSaving(false); }
                  }}>{passwordResendCooldown ? `Renvoyer dans ${passwordResendCooldown} s` : "Renvoyer un code"}</Button>}
                  <Button type="button" variant="outline" onClick={() => { setEditingPassword(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordCode(""); setPasswordProof(""); setPasswordCodeExpiresAt(""); setPasswordError(""); }} disabled={passwordSaving}>Annuler</Button>
                </div>
              </form>
            )}
          </div>
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

        <section className="min-w-0 space-y-3 rounded bg-white p-4 shadow sm:p-6" aria-labelledby="data-export-title">
          <h2 id="data-export-title" className="text-xl font-semibold">Mes données personnelles</h2>
          <p className="text-sm text-gray-700">Téléchargez une copie JSON des données associées à votre compte.</p>
          <Button onClick={handleDataExport} disabled={exporting} aria-describedby={exportError ? "data-export-error" : undefined}>
            {exporting ? "Préparation de l’export…" : "Télécharger mes données"}
          </Button>
          {exportError && <p id="data-export-error" role="alert" className="text-sm text-red-700">{exportError}</p>}
        </section>

        <section className="min-w-0 space-y-3 rounded border border-red-200 bg-red-50 p-4 shadow sm:p-6" aria-labelledby="delete-account-title">
          <h2 id="delete-account-title" className="text-xl font-semibold text-red-900">Supprimer mon compte</h2>
          <p className="text-sm text-red-900">
            Cette action efface votre identité de compte. Certains éléments nécessaires à l’intégrité des transactions Marketplace peuvent être conservés sous forme anonymisée. Cette action est irréversible.
          </p>
          {!showDeletionConfirm ? (
            <Button variant="destructive" onClick={() => setShowDeletionConfirm(true)}>
              Supprimer mon compte
            </Button>
          ) : (
            <div className="space-y-3" role="group" aria-label="Confirmation de suppression de compte">
              <label className="flex flex-col gap-1 text-sm font-medium text-red-950" htmlFor="delete-account-confirmation">
                Saisissez SUPPRIMER pour confirmer
                <input
                  id="delete-account-confirmation"
                  className="max-w-sm rounded border border-red-300 bg-white px-3 py-2"
                  value={deletionPhrase}
                  onChange={(event) => setDeletionPhrase(event.target.value)}
                  autoComplete="off"
                />
              </label>
              {deletionError && <p role="alert" className="text-sm text-red-800">{deletionError}</p>}
              <div className="flex flex-wrap gap-3">
                <Button variant="destructive" onClick={handleAccountDeletion} disabled={deletionPhrase !== "SUPPRIMER" || deleting}>
                  {deleting ? "Suppression…" : "Confirmer la suppression"}
                </Button>
                <Button variant="outline" onClick={() => { setShowDeletionConfirm(false); setDeletionPhrase(""); setDeletionError(""); }} disabled={deleting}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
