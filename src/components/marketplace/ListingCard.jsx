// src/components/marketplace/ListingCard.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { mediaUrl, defaultAvatar } from "../../utils/media";

export default function ListingCard({ listing }) {
  const imageUrl = listing.image
    ? listing.image.startsWith("http")
      ? listing.image
      : `http://localhost:8080${listing.image}`
    : "http://localhost:8080/uploads/avatars/default.png";

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle>{listing.title}</CardTitle>
        <CardDescription>{listing.price} €</CardDescription>
      </CardHeader>
      <CardContent>
        <Avatar className="w-16 h-16"><AvatarImage src={imageUrl || defaultAvatar} /><AvatarFallback>👤</AvatarFallback></Avatar>
        <p className="text-gray-700">{listing.description}</p>
      </CardContent>
    </Card>
  );
}
