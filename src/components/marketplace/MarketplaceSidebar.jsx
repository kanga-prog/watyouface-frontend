import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import ListingCard from "./ListingCard";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import CreateListingDialog from "./CreateListingDialog";

export default function MarketplaceSidebar({ currentUser, refreshUser }) {
  const [listings, setListings] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    onlyAvailable: false,
  });

  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState(null);
  const toastOk = (msg) => {
    setToast({ type: "success", msg });
    setTimeout(() => setToast(null), 2500);
  };
  const toastErr = (msg) => {
    setToast({ type: "error", msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await api.getListings();
      setListings(data);
    } catch (e) {
      toastErr(e?.message || "Impossible de charger les annonces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredListings = useMemo(() => {
    let filtered = listings;

    if (filters.category) {
      filtered = filtered.filter((l) =>
        (l.category || "").toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.minPrice) filtered = filtered.filter((l) => l.price >= Number(filters.minPrice));
    if (filters.maxPrice) filtered = filtered.filter((l) => l.price <= Number(filters.maxPrice));

    if (filters.onlyAvailable) filtered = filtered.filter((l) => l.status === "AVAILABLE");

    return filtered;
  }, [listings, filters]);

  const handleCardAction = async (evt) => {
    try {
      if (evt?.type === "update") {
        toastOk(`Statut mis à jour → ${evt.status}`);
        await loadListings();

        if (evt.status === "PAID" && refreshUser) {
          await refreshUser();
        }
        return;
      }

      if (evt?.type === "chat") {
        // ici tu peux router vers /messages
        return;
      }
    } catch (e) {
      toastErr(e?.message || "Erreur");
    }
  };

  return (
    <Card className="w-80 p-4 space-y-4 h-full flex flex-col">
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-xl shadow-lg border text-sm ${
            toast.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <CardHeader>
        <CardTitle>🛒 Marketplace</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 overflow-y-auto">
        <Button className="w-full" onClick={() => setOpenCreate(true)} disabled={!currentUser?.id}>
          ➕ Nouvelle annonce
        </Button>

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
              onCheckedChange={(checked) =>
                setFilters({ ...filters, onlyAvailable: checked === true })
              }
            />
            <Label htmlFor="onlyAvailable">Disponible uniquement</Label>
          </div>

          <Button onClick={loadListings} className="w-full" disabled={loading}>
            {loading ? "Chargement..." : "🔄 Rafraîchir"}
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : filteredListings.length === 0 ? (
          <p className="text-center text-gray-400">Aucune annonce</p>
        ) : (
          filteredListings.map((l) => (
            <ListingCard key={l.id} listing={l} currentUser={currentUser} onAction={handleCardAction} />
          ))
        )}
      </CardContent>

      <CreateListingDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreated={async () => {
          toastOk("Annonce créée ✅");
          await loadListings();
        }}
      />
    </Card>
  );
}
