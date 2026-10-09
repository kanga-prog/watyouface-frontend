import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MarketplaceSidebar from "../components/marketplace/MarketplaceSidebar";
import { api } from "../utils/api";

export default function Marketplace() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Fonction pour rafraîchir le profil (utile pour le wallet)
  const refreshUser = async () => {
    try {
      const data = await api.getProfile();
      setCurrentUser(data);
    } catch {
      navigate("/login");
    }
  };

  useEffect(() => {
    refreshUser();
    // Initial profile load only; refreshUser redirects when the session is invalid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentUser) {
    return <p role="status" className="p-6 text-center text-gray-500">Chargement de votre profil…</p>;
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] p-3 sm:p-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <header>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Marketplace communautaire</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Consultez les annonces et suivez le cycle de vente avec des crédits de démonstration.</p>
        </header>
        <MarketplaceSidebar currentUser={currentUser} refreshUser={refreshUser} />
      </div>
    </main>
  );
}
