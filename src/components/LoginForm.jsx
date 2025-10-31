// src/components/LoginForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api"; // ✅ Importe api

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Utilise api.login()
      const res = await api.login(formData);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const token = await res.text();
      localStorage.setItem("token", token);
      setMessage("✅ Connexion réussie !");
      navigate("/");
    } catch (err) {
      console.error("Erreur lors du login :", err);
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Connexion</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          placeholder="Adresse e-mail"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white rounded p-2 hover:bg-green-700"
        >
          Se connecter
        </button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}