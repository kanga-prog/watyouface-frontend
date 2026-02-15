import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import ListingCard from "./ListingCard";
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Checkbox, Label } from "../ui";

export default function MarketplaceSidebar({ currentUser, refreshUser }) {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({ category: "", minPrice: "", maxPrice: "", onlyAvailable: false });
  const [loading, setLoading] = useState(true);

  // Charger les annonces
  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await api.getListings();
      setListings(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error("Erreur marketplace :", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  // Filtrer les annonces selon les critères
  const handleFilterChange = () => {
    let filtered = listings;
    if (filters.category)
      filtered = filtered.filter((l) => l.category?.toLowerCase().includes(filters.category.toLowerCase()));
    if (filters.minPrice) filtered = filtered.filter((l) => l.price >= Number(filters.minPrice));
    if (filters.maxPrice) filtered = filtered.filter((l) => l.price <= Number(filters.maxPrice));
    if (filters.onlyAvailable) filtered = filtered.filter((l) => l.status === "AVAILABLE");
    return filtered;
  };

  // Action déclenchée par ListingCard (chat, update)
  const handleAction = async ({ type, conversationId, listing, listingId, status }) => {
    if (type === "chat") {
      // redirect vers inbox/chat avec conversationId
      console.log("Ouvrir chat pour listing", listing.title, conversationId);
    }

    if (type === "update") {
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status } : l))
      );

      // 🔹 Mise à jour du wallet après paiement
      if (status === "PAID" && refreshUser) {
        await refreshUser(); // récupère le nouveau solde
      }
    }
  };

  const filteredListings = handleFilterChange();

  return (
    <Card className="w-80 p-4 space-y-4 h-full flex flex-col">
      <CardHeader>
        <CardTitle>🛒 Marketplace</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 overflow-y-auto">
        {/* FILTRES */}
        <div className="space-y-2 mb-4">
          <Input
            placeholder="Catégorie"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Prix min"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Prix max"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="onlyAvailable"
              checked={filters.onlyAvailable}
              onCheckedChange={(checked) => setFilters({ ...filters, onlyAvailable: checked })}
            />
            <Label htmlFor="onlyAvailable">Disponible uniquement</Label>
          </div>
          <Button onClick={loadListings} className="w-full">🔄 Rafraîchir</Button>
        </div>

        {/* LISTINGS */}
        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : filteredListings.length === 0 ? (
          <p className="text-center text-gray-400">Aucune annonce</p>
        ) : (
          filteredListings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              currentUser={currentUser}
              onAction={handleAction}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
