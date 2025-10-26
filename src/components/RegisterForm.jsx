import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, acceptTerms: false }),
    });

    const message = await response.text();
    if (response.ok) {
      // Simule l’enregistrement utilisateur temporaire
      // (dans ton backend, tu pourras lui créer un compte "en attente d’acceptation")
      localStorage.setItem("userId", Date.now()); // temporaire pour la démo
      navigate("/contract");
    } else {
      alert(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Inscription</h2>
      <input
        name="username"
        placeholder="Nom d'utilisateur"
        value={formData.username}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />
      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />
      <input
        name="password"
        type="password"
        placeholder="Mot de passe"
        value={formData.password}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        S'inscrire
      </button>
    </form>
  );
}

export default RegisterForm;
