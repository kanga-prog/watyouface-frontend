import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

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
      const res = await api.login(formData);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("avatarUrl", data.avatarUrl);
      setMessage("✅ Connexion réussie !");
      navigate("/");
    } catch (err) {
      console.error("Erreur lors du login :", err);
      setMessage("❌ " + err.message);
    }
  };

  return (
    <Card className="p-8 max-w-md mx-auto mt-20">
      <h2 className="text-2xl font-semibold mb-6 text-center">Connexion</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          name="email"
          placeholder="Adresse e-mail"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Button type="submit" variant="default">
          Se connecter
        </Button>
      </form>
      {message && <p className="mt-3 text-center text-sm">{message}</p>}
    </Card>
  );
}
