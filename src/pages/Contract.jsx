import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { mediaUrl, defaultAvatar } from "../utils/media";

export default function Contract() {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await api.getActiveContract();
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

  const handleAccept = async () => {
    const tempData = localStorage.getItem("tempUserData");
    if (!tempData || !contract) {
      navigate("/register");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await api.register({
        ...JSON.parse(tempData),
        acceptTerms: true,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      localStorage.removeItem("tempUserData");
      navigate("/login", {
        state: { message: "✅ Compte créé avec succès !" },
      });
    } catch (err) {
      setError("Échec de l'inscription : " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = () => {
    localStorage.removeItem("tempUserData");
    navigate("/register");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Chargement du contrat légal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">📜 Contrat WatYouFace</h1>

        <div className="bg-white rounded-xl shadow">
          <div className="bg-blue-600 text-white px-6 py-4 font-semibold">
            {contract.title} — Version {contract.version}
          </div>
          <div className="p-6 whitespace-pre-line">{contract.content}</div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 text-center space-y-4">
          <p className="font-medium">Acceptez-vous les termes du contrat ?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleReject}
              className="px-5 py-2 border rounded"
            >
              ❌ Refuser
            </button>
            <button
              onClick={handleAccept}
              disabled={submitting}
              className="px-5 py-2 bg-green-600 text-white rounded"
            >
              {submitting ? "Validation..." : "✅ Accepter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
