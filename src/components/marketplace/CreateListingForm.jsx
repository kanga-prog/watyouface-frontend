import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { mediaUrl, defaultAvatar } from "../../utils/media";
import { marketplaceApi } from "../../utils/marketplaceApi";

export default function ListingCard({ listing, currentUser, onChat, onStatusChange }) {
  const [modalOpen, setModalOpen] = useState(false);

  const imageUrl = listing.image
    ? listing.image.startsWith("http")
      ? listing.image
      : `http://localhost:8080${listing.image}`
    : defaultAvatar;

  const isSeller = currentUser?.id === listing.sellerId;
  const isAvailable = listing.status === "available";

  const handleChat = () => {
    if (onChat) onChat(listing.sellerId, listing.id);
  };

  const handleStatus = async (newStatus) => {
    try {
      await marketplaceApi.updateListing(listing.id, { status: newStatus });
      onStatusChange?.();
    } catch (err) {
      console.error(err);
      alert("Erreur changement de statut");
    }
  };

  return (
    <>
      <Card className="rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition relative">
        <CardHeader onClick={() => setModalOpen(true)}>
          <CardTitle>{listing.title}</CardTitle>
          <p className="text-gray-500">{listing.price} €</p>
          {listing.status === "sold" && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">VENDU</span>
          )}
        </CardHeader>
        <CardContent>
          <Avatar className="w-32 h-32 mx-auto mb-2">
            <AvatarImage src={imageUrl} />
            <AvatarFallback>🛒</AvatarFallback>
          </Avatar>
          <p className="text-gray-700 text-sm">{listing.description}</p>

          <div className="flex justify-between mt-4 flex-wrap gap-2">
            {isAvailable && !isSeller && (
              <Button variant="outline" onClick={handleChat}>💬 Chat</Button>
            )}
            {isSeller && listing.status === "pending" && (
              <>
                <Button onClick={() => handleStatus("accepted")}>✅ Accepter</Button>
                <Button onClick={() => handleStatus("refused")}>❌ Refuser</Button>
              </>
            )}
            {isSeller && listing.status === "accepted" && (
              <Button onClick={() => handleStatus("shipped")}>🚚 Expédier</Button>
            )}
            {!isSeller && listing.status === "shipped" && (
              <Button onClick={() => handleStatus("sold")}>📦 Reçu</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal pour voir l'image agrandie */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <div className="bg-white rounded-xl p-4 max-w-lg w-full">
            <img src={imageUrl} alt={listing.title} className="w-full rounded-xl" />
            <h2 className="font-bold text-lg mt-2">{listing.title}</h2>
            <p className="text-gray-600">{listing.description}</p>
            <p className="text-gray-800 font-semibold mt-1">{listing.price} €</p>
            <Button className="mt-4" onClick={() => setModalOpen(false)}>Fermer</Button>
          </div>
        </div>
      )}
    </>
  );
}
