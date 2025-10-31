// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activeContractId, setActiveContractId] = useState(null);
  const [loadingContract, setLoadingContract] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ Utilise l'IP WSL2
    fetch("http://172.28.24.211:8080/api/user/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Non authentifié");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    // ✅ Utilise l'IP WSL2
    fetch("http://172.28.24.211:8080/api/contracts/active")
      .then((res) => {
        if (!res.ok) throw new Error("Pas de contrat actif");
        return res.json();
      })
      .then((data) => {
        setActiveContractId(data.id);
        setLoadingContract(false);
      })
      .catch(() => {
        setLoadingContract(false);
      });
  }, [user]);

  const handleDownloadContract = async () => {
    if (!activeContractId || !user) return;

    setDownloading(true);
    const token = localStorage.getItem("token");
    try {
      // ✅ Utilise l'IP WSL2
      const response = await fetch(`http://172.28.24.211:8080/api/contracts/${activeContractId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            👋 Bienvenue, <span className="text-blue-600">{user.username}</span>
          </h1>
          <p className="mt-2 text-gray-600">Gérez votre compte et vos documents légaux</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-800 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.username}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

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
                  downloading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {downloading ? 'Préparation...' : '📄 Télécharger le PDF'}
              </button>
            </div>
          ) : (
            <p className="text-red-600">Aucun contrat actif.</p>
          )}
        </div>
      </div>
    </div>
  );
}