// src/components/marketplace/CreateListingForm.jsx
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { api } from "../../utils/api";

export default function CreateListingForm({ onListingCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      if (image) formData.append("image", image);

      const res = await api.createMarketplaceListing(formData);
      const data = await res.json();

      if (res.ok) {
        onListingCreated?.();
        setTitle("");
        setDescription("");
        setPrice("");
        setImage(null);
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <Input
        placeholder="Titre de l'annonce"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Prix (€)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Création..." : "Publier l'annonce"}
      </Button>
    </form>
  );
}
