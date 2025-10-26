import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Contract() {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/contracts/active")
      .then((res) => res.json())
      .then((data) => {
        setContract(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAccept = async () => {
    const userId = localStorage.getItem("userId"); // récupéré après l’inscription
    if (!userId) return alert("Utilisateur non trouvé.");

    // Headers pour le fetch
    const headers = {
      "Content-Type": "application/json",
      // "Authorization": `Bearer ${token}` // à activer plus tard
    };

    try {
      const res = await fetch("http://localhost:8080/api/contracts/accept", {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId,
          contractId: contract.id,
          accepted: true,
        }),
      });

      const message = await res.text();
      alert(message);

      if (res.ok) navigate("/login");
    } catch (error) {
      alert("Erreur lors de l'acceptation du contrat : " + error.message);
    }
  };

  const handleRefuse = () => {
    alert("Vous avez refusé le contrat. Votre compte ne sera pas activé.");
    navigate("/register");
  };

  if (loading) return <p className="text-center mt-10">Chargement du contrat...</p>;
  if (!contract) return <p className="text-center mt-10 text-red-500">Aucun contrat trouvé.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded-2xl">
      <h1 className="text-2xl font-bold mb-4 text-center">{contract.title}</h1>
      <p className="whitespace-pre-wrap mb-8">{contract.content}</p>

      <div className="flex justify-center gap-6">
        <button
          onClick={handleAccept}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          ✅ Accepter
        </button>
        <button
          onClick={handleRefuse}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          ❌ Refuser
        </button>
      </div>
    </div>
  );
}

export default Contract;
