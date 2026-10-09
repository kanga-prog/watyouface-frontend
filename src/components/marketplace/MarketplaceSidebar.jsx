import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import ListingCard from "./ListingCard";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import CreateListingDialog from "./CreateListingDialog";

export default function MarketplaceSidebar({ currentUser, refreshUser, onOpenChat }) {
  const [listings, setListings] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);

  // ✅ backend-aligned filters (pas de category dans ListingDTO)
  const [filters, setFilters] = useState({
    query: "",
    minPrice: "",
    maxPrice: "",
    onlyAvailable: false,
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [toast, setToast] = useState(null); // { type: "success"|"error", msg }
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
    setLoadError(null);
    try {
      const data = await api.getListings();
      setListings(Array.isArray(data) ? data : []);
    } catch {
      setListings([]);
      setLoadError("Impossible de charger les annonces. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
    // Initial load only: data is refreshed explicitly after an action or on demand.
  }, []);

  const filteredListings = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const min = filters.minPrice === "" ? null : Number(filters.minPrice);
    const max = filters.maxPrice === "" ? null : Number(filters.maxPrice);

    return (listings || [])
      .filter((l) => {
        if (!l) return false;

        if (filters.onlyAvailable && l.status !== "AVAILABLE") return false;

        if (q) {
          const hay = `${l.title || ""} ${l.description || ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }

        if (min != null && Number.isFinite(min) && (l.price ?? 0) < min) return false;
        if (max != null && Number.isFinite(max) && (l.price ?? 0) > max) return false;

        return true;
      })
      // optionnel: trier “AVAILABLE” d’abord
      .sort((a, b) => {
        const score = (s) => (s === "AVAILABLE" ? 0 : s === "PENDING" ? 1 : 2);
        return score(a.status) - score(b.status);
      });
  }, [listings, filters]);

  const handleCardAction = async (evt) => {
    try {
      if (evt?.type === "update") {
        toastOk(`Statut mis à jour → ${evt.status}`);
        await loadListings();

        // wallet refresh utile après paiement
        if (evt.status === "PAID" && refreshUser) {
          await refreshUser();
        }
        return;
      }

      if (evt?.type === "chat") {
        onOpenChat?.(evt.conversationId);
        toastOk("Conversation ouverte 💬");
        return;
      }
    } catch (e) {
      toastErr(e?.message || "Erreur");
    }
  };

  return (
    <Card className="w-full p-4 space-y-4 flex flex-col">
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

      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Marketplace</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={loadListings} disabled={loading}>
          Actualiser
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        <Button
          className="w-full"
          onClick={() => setOpenCreate(true)}
          disabled={!currentUser?.id}
        >
          ➕ Nouvelle annonce
        </Button>

        {/* FILTRES */}
        <div className="grid gap-2 mb-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            aria-label="Rechercher une annonce"
            placeholder="Rechercher (titre / description)"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />

          <div className="flex gap-2 md:col-span-2">
            <Input
              type="number"
              aria-label="Prix minimum"
              placeholder="Prix min"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
            <Input
              type="number"
              aria-label="Prix maximum"
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

          {/* Suppression du bouton “Rafraîchir” (doublon). Le refresh se fait après création/action. */}
        </div>

        {/* LISTINGS */}
        {loading ? (
          <p role="status" className="text-center text-gray-500">Chargement des annonces…</p>
        ) : loadError ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {loadError}
          </div>
        ) : filteredListings.length === 0 ? (
          <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">Aucune annonce disponible.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredListings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              currentUser={currentUser}
              onAction={handleCardAction}
            />
          ))}</div>
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
