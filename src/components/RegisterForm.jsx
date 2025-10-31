// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch("http://172.28.24.211:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // ❌ acceptTerms: false → compte non validé
      body: JSON.stringify({ ...formData, acceptTerms: false }),
    });

    const data = await response.json();
    if (response.ok) {
      // ✅ Sauvegarde userId pour la page contrat
      localStorage.setItem("userId", data.userId);
      navigate("/contract"); // 🔁 Vers la page contrat
    } else {
      alert(data.message || data);
    }
  } catch (err) {
    alert("Erreur réseau : " + err.message);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Inscription</h2>

        <input
          type="text"
          name="username"
          placeholder="Nom d'utilisateur"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Adresse e-mail"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Continuer
        </button>
      </form>
    </div>
  );
}
