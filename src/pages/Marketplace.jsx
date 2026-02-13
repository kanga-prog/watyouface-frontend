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
  }, []);

  if (!currentUser) return null;

  return (
    <div className="flex w-full h-screen bg-gray-50 pt-20">
      {/* SIDEBAR MARKETPLACE */}
      <aside className="w-96 border-r flex flex-col">
        <MarketplaceSidebar currentUser={currentUser} refreshUser={refreshUser} />
      </aside>

      {/* CONTENU CENTRAL (optionnel, feed ou autres) */}
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Sélectionnez un article dans le marketplace.</p>
      </main>
    </div>
  );
}
