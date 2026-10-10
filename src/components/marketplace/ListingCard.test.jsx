import { fireEvent, render, screen } from "@testing-library/react";
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
});
