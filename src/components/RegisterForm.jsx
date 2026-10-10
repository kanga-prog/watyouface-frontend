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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/contract", { state: { registration: formData } });
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20 p-6 sm:p-8">
      <h2 className="text-2xl font-semibold mb-6 text-center">Inscription</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="register-username" className="flex flex-col gap-1 text-sm font-medium">
          Nom d'utilisateur
          <Input
            id="register-username"
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            minLength={3}
            maxLength={50}
            autoComplete="username"
            required
          />
        </label>
        <label htmlFor="register-email" className="flex flex-col gap-1 text-sm font-medium">
          Adresse e-mail
          <Input
            id="register-email"
            type="email"
            name="email"
            placeholder="Adresse e-mail"
            value={formData.email}
            onChange={handleChange}
            maxLength={255}
            autoComplete="email"
            required
          />
        </label>
        <label htmlFor="register-password" className="flex flex-col gap-1 text-sm font-medium">
          Mot de passe
          <Input
            id="register-password"
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
            aria-describedby="register-password-hint"
            required
          />
          <span id="register-password-hint" className="text-xs font-normal text-muted-foreground">
            12 caractères minimum.
          </span>
        </label>
        <Button type="submit" variant="default">
          Continuer
        </Button>
      </form>
    </Card>
  );
}
