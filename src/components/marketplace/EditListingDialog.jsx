import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { defaultAvatar, mediaUrl } from "../../utils/media";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";

export default function EditListingDialog({ open, onOpenChange, listing, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open || !listing) return;
    setTitle(listing.title || "");
    setDescription(listing.description || "");
    setPrice(String(listing.price ?? ""));
    setImage(listing.image || "");
    setFile(null);
    setErr("");
  }, [open, listing]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const canSubmit = useMemo(() => {
    const p = Number(price);
    return title.trim().length > 0 && Number.isFinite(p) && p > 0;
  }, [title, price]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErr("Image uniquement");
      return;
    }
    setErr("");
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!listing?.id) return;
    setErr("");
    if (!canSubmit) {
      setErr("Titre et prix (> 0) requis.");
      return;
    }

    setLoading(true);
    try {
      let finalImage = image.trim() ? image.trim() : null;
      if (file) {
        const { imageUrl } = await api.uploadMarketplaceImage(file);
        finalImage = imageUrl;
      }

      const updated = await api.updateListing(listing.id, {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        image: finalImage,
      });

      onSaved?.(updated);
      onOpenChange(false);
    } catch (e) {
      setErr(e?.message || "Erreur modification annonce");
    } finally {
      setLoading(false);
    }
  };

  const previewSrc = preview
    ? preview
    : image.trim()
      ? (image.trim().startsWith("http") ? image.trim() : mediaUrl(image.trim()))
      : defaultAvatar;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>✏️ Modifier l’annonce</DialogTitle>
        <DialogDescription>Met à jour le titre, la description, le prix et l’image.</DialogDescription>

        {err && (
          <div className="text-sm border rounded-xl px-3 py-2 bg-red-50 border-red-200">
            {err}
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Prix (WUF)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-gray-50 p-3">
              <p className="text-sm font-semibold mb-2">Aperçu</p>
              <div className="w-full h-48 rounded-lg overflow-hidden bg-white border flex items-center justify-center">
                <img
                  src={previewSrc}
                  alt="preview"
                  className={previewSrc === defaultAvatar ? "w-24 h-24 opacity-60" : "w-full h-full object-contain"}
                />
              </div>
              <div className="mt-3 space-y-2">
                <Label>Image (upload)</Label>
                <Input type="file" accept="image/*" onChange={handleFile} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image (URL ou /media/...)</Label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/media/marketplace/x.png"
              />
              <p className="text-xs text-gray-500">Optionnel : si tu upload une image, elle prendra priorité.</p>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Annuler
                </Button>
                <Button onClick={submit} disabled={loading || !canSubmit}>
                  {loading ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
