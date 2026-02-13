import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media";
import { api } from "../../utils/api";;
import Modal from "../ui/dialog";

export default function ListingCard({ listing, currentUser, onAction }) {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const imageUrl = listing.image
    ? listing.image.startsWith("http")
      ? listing.image
      : mediaUrl(listing.image)
    : defaultAvatar;

  const isSeller = currentUser?.id === listing.sellerId;
  const isBuyer = currentUser?.id !== listing.sellerId;

  /* ===== CHAT ===== */
  const handleChat = async () => {
    setLoading(true);
    try {
      const conv = await marcketplaceApi.contactSeller(listing.sellerId);
      onAction?.({ type: "chat", conversationId: conv.id, listing });
    } catch {
      alert("Impossible d'ouvrir le chat.");
    } finally {
      setLoading(false);
    }
  };

  /* ===== VENDEUR ===== */
  const updateStatus = async (status) => {
    setLoading(true);
    try {
      await marcketplaceApi.updateListing(listing.id, { status });
      onAction?.({ type: "update", listingId: listing.id, status });
    } finally {
      setLoading(false);
    }
  };

  /* ===== PAIEMENT WALLET ===== */
  const handlePay = async () => {
    if (!currentUser?.wallet || currentUser.wallet < listing.price) {
      alert("Solde Wallet insuffisant.");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Débit wallet
      await marketplaceApi.requestPayment(
        currentUser.id,
        listing.sellerId,
        listing.price
      );

      // 2️⃣ Verrouiller l'annonce
      await marketplaceApi.updateListing(listing.id, { status: "paid" });

      onAction?.({ type: "update", listingId: listing.id, status: "paid" });
      alert("Paiement effectué avec succès ✅");
    } catch {
      alert("Erreur lors du paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="rounded-2xl shadow-lg relative">
        {["paid", "received"].includes(listing.status) && (
          <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 rounded-br-lg font-bold">
            VENDU
          </div>
        )}

        <CardHeader>
          <CardTitle>{listing.title}</CardTitle>
          <p className="text-gray-600 font-semibold">{listing.price} WUF</p>
        </CardHeader>

        <CardContent className="space-y-2">
          <div onClick={() => setModalOpen(true)} className="cursor-pointer">
            <Avatar className="w-full h-48">
              <AvatarImage
                src={imageUrl}
                className="object-cover w-full h-full rounded-xl"
              />
              <AvatarFallback>📦</AvatarFallback>
            </Avatar>
          </div>

          <p className="text-gray-700">{listing.description}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {/* ACHETEUR */}
            {isBuyer && listing.status === "available" && (
              <Button size="sm" onClick={handleChat} disabled={loading}>
                💬 Chat
              </Button>
            )}

            {isBuyer && listing.status === "accepted" && (
              <Button size="sm" onClick={handlePay} disabled={loading}>
                💳 Payer
              </Button>
            )}

            {isBuyer && listing.status === "shipped" && (
              <Button size="sm" onClick={() => updateStatus("received")} disabled={loading}>
                📦 Reçu
              </Button>
            )}

            {/* VENDEUR */}
            {isSeller && listing.status === "pending" && (
              <>
                <Button size="sm" onClick={() => updateStatus("accepted")} disabled={loading}>
                  ✅ Accepter
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateStatus("refused")}
                  disabled={loading}
                >
                  ❌ Refuser
                </Button>
              </>
            )}

            {isSeller && listing.status === "paid" && (
              <Button size="sm" onClick={() => updateStatus("shipped")} disabled={loading}>
                🚚 Expédier
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <img src={imageUrl} alt={listing.title} className="w-full rounded-xl" />
        </Modal>
      )}
    </>
  );
}
