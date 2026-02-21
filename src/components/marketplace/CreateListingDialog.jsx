import React, { useMemo, useState } from "react";
import { api } from "../../utils/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function CreateListingDialog({ open, onOpenChange, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    const p = Number(price);
    return title.trim().length > 0 && Number.isFinite(p) && p > 0;
  }, [title, price]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setImage("");
    setErr("");
  };

  const close = (v) => {
    onOpenChange(v);
    if (!v) reset();
  };

  const submit = async () => {
    setErr("");
    if (!canSubmit) {
      setErr("Titre et prix (> 0) requis.");
      return;
    }

    setLoading(true);
    try {
      const created = await api.createListing({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        image: image.trim() ? image.trim() : null,
      });

      onCreated?.(created);
      close(false);
    } catch (e) {
      setErr(e?.message || "Erreur création annonce");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        <VisuallyHidden>
          <DialogTitle>Créer une annonce</DialogTitle>
          <DialogDescription>
            Formulaire de création d’annonce marketplace
          </DialogDescription>
        </VisuallyHidden>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">➕ Nouvelle annonce</h2>
            <p className="text-sm text-gray-500">
              Renseigne un titre, une description et un prix.
            </p>
          </div>

          {err && (
            <div className="text-sm border rounded-xl px-3 py-2 bg-red-50 border-red-200">
              {err}
            </div>
          )}

          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: PS5"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Neuve, garantie, livraison..."
            />
          </div>

          <div className="space-y-2">
            <Label>Prix (WUF)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="499"
            />
          </div>

          <div className="space-y-2">
            <Label>Image (URL ou /media/...)</Label>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/media/x.png"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => close(false)} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={loading || !canSubmit}>
              {loading ? "Création..." : "Créer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
