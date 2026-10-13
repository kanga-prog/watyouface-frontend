import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ListingCard from "./ListingCard";
import { api } from "../../utils/api";

vi.mock("../../utils/api", () => ({
  api: {
    requestPurchase: vi.fn(),
    getOrCreateConversation: vi.fn(),
  },
}));

vi.mock("./EditListingDialog", () => ({ default: () => null }));
vi.mock("../ui/dialog", () => ({
  Dialog: ({ children }) => <div>{children}</div>,
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <div>{children}</div>,
  DialogDescription: ({ children }) => <div>{children}</div>,
}));

const listing = {
  id: 15,
  title: "Console de démonstration",
  description: "Annonce fictive",
  price: 30,
  sellerId: 1,
  buyerId: null,
  status: "AVAILABLE",
};

describe("ListingCard API error feedback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the marketplace business error returned by the API", async () => {
    api.requestPurchase.mockRejectedValue(new Error("Demande impossible dans l'état AVAILABLE"));
    render(<ListingCard listing={listing} currentUser={{ id: 2 }} />);

    fireEvent.click(screen.getByRole("button", { name: /Demander achat/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Demande impossible dans l'état AVAILABLE");
  });

  it("requests purchase and reports the persisted next status to its parent", async () => {
    api.requestPurchase.mockResolvedValue({ message: "Demande envoyée" });
    const onAction = vi.fn();
    render(<ListingCard listing={listing} currentUser={{ id: 2 }} onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: /Demander achat/ }));

    await waitFor(() => expect(api.requestPurchase).toHaveBeenCalledWith(listing.id));
    await waitFor(() => expect(onAction).toHaveBeenCalledWith({
      type: "update", listingId: listing.id, status: "PENDING",
    }));
  });

  it("renders the uploaded listing image from its persisted media URL", () => {
    render(<ListingCard listing={{ ...listing, image: "/media/marketplace/listing-test.jpg" }} currentUser={{ id: 2 }} />);

    expect(screen.getByRole("img", { name: "Illustration de l’annonce Console de démonstration" }))
      .toHaveAttribute("src", "http://localhost:8080/media/marketplace/listing-test.jpg");
  });

  it("creates or reuses a seller conversation and emits the chat navigation action", async () => {
    api.getOrCreateConversation.mockResolvedValue({ id: 42 });
    const onAction = vi.fn();
    render(<ListingCard listing={listing} currentUser={{ id: 2 }} onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: "Contacter le vendeur" }));

    await waitFor(() => expect(api.getOrCreateConversation).toHaveBeenCalledWith(listing.sellerId));
    await waitFor(() => expect(onAction).toHaveBeenCalledWith({
      type: "chat", conversationId: 42, listing,
    }));
  });
});
