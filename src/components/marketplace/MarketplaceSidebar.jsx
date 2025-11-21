// src/components/marketplace/MarketplaceSidebar.jsx
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Checkbox,
  Label,
  Input,
} from "../ui"; // 🔹 Shadcn UI components

export default function MarketplaceSidebar({ filters, onFilterChange }) {
  const [category, setCategory] = useState(filters?.category || "");
  const [minPrice, setMinPrice] = useState(filters?.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(filters?.maxPrice || "");
  const [onlyAvailable, setOnlyAvailable] = useState(filters?.onlyAvailable || false);

  const handleApplyFilters = () => {
    onFilterChange?.({
      category,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      onlyAvailable,
    });
  };

  const handleReset = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setOnlyAvailable(false);
    onFilterChange?.({});
  };

  return (
    <Card className="w-80 p-4 space-y-4">
      <CardHeader>
        <CardTitle>Filtrer les annonces</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col space-y-1">
          <Label htmlFor="category">Catégorie</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ex: Électronique"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <Label htmlFor="minPrice">Prix min</Label>
          <Input
            type="number"
            id="minPrice"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <Label htmlFor="maxPrice">Prix max</Label>
          <Input
            type="number"
            id="maxPrice"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="1000"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="onlyAvailable"
            checked={onlyAvailable}
            onCheckedChange={(checked) => setOnlyAvailable(checked)}
          />
          <Label htmlFor="onlyAvailable">Disponible uniquement</Label>
        </div>

        <div className="flex gap-2 mt-2">
          <Button onClick={handleApplyFilters} className="flex-1">
            Appliquer
          </Button>
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
