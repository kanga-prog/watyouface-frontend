import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("tempUserData", JSON.stringify(formData));
    navigate("/contract");
  };

  return (
    <Card className="p-8 max-w-md mx-auto mt-20">
      <h2 className="text-2xl font-semibold mb-6 text-center">Inscription</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="text"
          name="username"
          placeholder="Nom d'utilisateur"
          value={formData.username}
          onChange={handleChange}
          required
        />
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
          Continuer
        </Button>
      </form>
      {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
    </Card>
  );
}
