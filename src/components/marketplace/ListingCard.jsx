import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
// ⚠️ Ne pas utiliser <Avatar> pour des images produit (ça force rounded-full)
import { mediaUrl, defaultAvatar } from "../../utils/media";
import { api } from "../../utils/api";

import EditListingDialog from "./EditListingDialog";
import ListingStatusBadge from "./ListingStatusBadge";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";

export default function ListingCard({ listing, currentUser, onAction }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [error, setError] = useState(null);

  const imageUrl = listing?.image
    ? listing.image.startsWith("http")
      ? listing.image
      : mediaUrl(listing.image)
    : defaultAvatar;

  const meId = currentUser?.id;
  const isSeller = meId != null && meId === listing?.sellerId;
  const isBuyer = listing?.buyerId != null && meId === listing.buyerId;

  const status = listing?.status; // AVAILABLE / PENDING / ACCEPTED / PAID / SHIPPED / RECEIVED / REFUSED

  const handleChat = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ si je suis le seller -> je veux parler à l'acheteur (s'il existe)
      // ✅ sinon -> je parle au seller
      const otherUserId = isSeller ? listing?.buyerId : listing?.sellerId;

      if (!otherUserId) {
        throw new Error("Aucun utilisateur à contacter pour ce listing.");
      }

      const conv = await api.getOrCreateConversation(otherUserId);
      onAction?.({ type: "chat", conversationId: conv.id, listing });
    } catch {
      setError("Impossible d’ouvrir la conversation. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  const doAction = async (fn, nextStatus) => {
    setLoading(true);
    setError(null);
    try {
      await fn();
      onAction?.({ type: "update", listingId: listing.id, status: nextStatus });
    } catch {
      setError("Cette action marketplace n’a pas pu être réalisée.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="rounded-2xl shadow-lg relative">
        <div className="absolute top-2 right-2">
          <ListingStatusBadge status={status} />
        </div>

        {["PAID", "SHIPPED", "RECEIVED"].includes(status) && (
          <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 rounded-br-lg font-bold">
            VENDU
          </div>
        )}

        <CardHeader>
          <CardTitle>{listing?.title || "Sans titre"}</CardTitle>
          <p className="text-gray-600 font-semibold">{listing?.price ?? 0} crédits démo</p>
        </CardHeader>

        <CardContent className="space-y-2">
          <button type="button" onClick={() => setOpen(true)} className="block w-full text-left" aria-label={`Agrandir l’image de ${listing?.title || "l’annonce"}`}>
            <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={imageUrl}
                alt={listing?.title ? `Illustration de l’annonce ${listing.title}` : "Illustration de l’annonce"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </button>

          <p className="text-gray-700">{listing?.description || ""}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {/* CRUD SELLER (AVAILABLE/PENDING uniquement) */}
            {isSeller && ["AVAILABLE", "PENDING"].includes(status) && (
              <>
                <Button size="sm" variant="outline" onClick={() => setOpenEdit(true)} disabled={loading}>
                  ✏️ Modifier
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm("Supprimer cette annonce ?")) return;
                    await doAction(() => api.deleteListing(listing.id), "DELETED");
                  }}
                  disabled={loading}
                >
                  🗑️ Supprimer
                </Button>
              </>
            )}

            {/* BUYER */}
            {!isSeller && status === "AVAILABLE" && (
              <>
                <Button size="sm" onClick={handleChat} disabled={loading}>
                  Contacter le vendeur
                </Button>
                <Button
                  size="sm"
                  onClick={() => doAction(() => api.requestPurchase(listing.id), "PENDING")}
                  disabled={loading}
                >
                  🛍️ Demander achat
                </Button>
              </>
            )}

            {isBuyer && status === "ACCEPTED" && (
              <Button
                size="sm"
                onClick={() => doAction(() => api.payListing(listing.id), "PAID")}
                disabled={loading}
              >
                Payer avec le wallet de démonstration
              </Button>
            )}

            {isBuyer && status === "SHIPPED" && (
              <Button
                size="sm"
                onClick={() => doAction(() => api.receiveListing(listing.id), "RECEIVED")}
                disabled={loading}
              >
                📦 Confirmer réception
              </Button>
            )}

            {/* SELLER */}
            {isSeller && status === "PENDING" && (
              <>
                <Button
                  size="sm"
                  onClick={() => doAction(() => api.acceptListing(listing.id), "ACCEPTED")}
                  disabled={loading}
                >
                  ✅ Accepter
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => doAction(() => api.refuseListing(listing.id), "REFUSED")}
                  disabled={loading}
                >
                  ❌ Refuser
                </Button>
              </>
            )}

            {isSeller && status === "PAID" && (
              <Button
                size="sm"
                onClick={() => doAction(() => api.shipListing(listing.id), "SHIPPED")}
                disabled={loading}
              >
                🚚 Marquer expédié
              </Button>
            )}

            {/* BONUS utile: permettre au seller d'ouvrir le chat une fois PENDING/ACCEPTED/PAID/SHIPPED */}
            {isSeller && ["PENDING", "ACCEPTED", "PAID", "SHIPPED"].includes(status) && (
              <Button size="sm" variant="outline" onClick={handleChat} disabled={loading || !listing?.buyerId}>
                Contacter l’acheteur
              </Button>
            )}
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          {/* ✅ sr-only à la place de VisuallyHidden */}
          <DialogTitle className="sr-only">Image de l’annonce</DialogTitle>
          <DialogDescription className="sr-only">
            Aperçu détaillé de l’image de l’annonce marketplace
          </DialogDescription>

          <img src={imageUrl} alt={listing?.title || "Image annonce"} className="w-full rounded-xl" />
        </DialogContent>
      </Dialog>

      <EditListingDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        listing={listing}
        onSaved={() => {
          onAction?.({ type: "update", listingId: listing.id, status });
        }}
      />
    </>
  );
}
