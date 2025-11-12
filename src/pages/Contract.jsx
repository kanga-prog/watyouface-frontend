import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Contract() {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Charger le contrat actif au montage
  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/contracts/active");
        if (!res.ok) throw new Error("Contrat non disponible");
        const data = await res.json();
        setContract(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, []);

  // Accepter le contrat → enregistrer l'utilisateur
  const handleAccept = async () => {
    const tempData = localStorage.getItem("tempUserData");
    if (!tempData || !contract) {
      navigate("/register");
      return;
    }

    const userData = JSON.parse(tempData);
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, acceptTerms: true }),
      });

      if (res.ok) {
        localStorage.removeItem("tempUserData");
        navigate("/login", { state: { message: "✅ Compte créé avec succès !" } });
      } else {
        const text = await res.text();
        setError("Échec de l'inscription : " + text);
      }
    } catch (err) {
      setError("Erreur réseau : " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Refuser → retour à l'inscription
  const handleReject = () => {
    localStorage.removeItem("tempUserData");
    navigate("/register");
  };

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement du contrat légal...</p>
        </div>
      </div>
    );
  }

  // Erreur de chargement
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Impossible de charger le contrat</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retour à l’inscription
          </button>
        </div>
      </div>
    );
  }

  // Affichage du contrat
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            📜 Contrat WatYouFace
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Veuillez lire attentivement les conditions ci-dessous avant de finaliser votre inscription.
          </p>
        </div>

        {/* Carte du contrat */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
          <div className="bg-blue-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {contract.title} — Version {contract.version}
            </h2>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="prose prose-blue max-w-none text-gray-800 whitespace-pre-line leading-relaxed">
              {contract.content}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-center text-gray-700 mb-6 text-lg font-medium">
            Acceptez-vous les termes de ce contrat ?
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={handleReject}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              ❌ Refuser
            </button>

            <button
              type="button"
              onClick={handleAccept}
              disabled={submitting}
              className={`px-6 py-3 font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                submitting
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validation en cours...
                </>
              ) : (
                "✅ Accepter le contrat"
              )}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            En acceptant, vous confirmez avoir lu et compris l’ensemble des conditions.
          </p>
        </div>
      </div>
    </div>
  );
}