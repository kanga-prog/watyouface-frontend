import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Admin from "./Admin";
import { api } from "../utils/api";

vi.mock("../utils/api", () => ({
  api: {
    getCurrentUser: vi.fn(),
    adminGetUsers: vi.fn(),
    adminGetPosts: vi.fn(),
    adminGetComments: vi.fn(),
    adminGetListings: vi.fn(),
    adminCreditWallet: vi.fn(),
    adminDeletePost: vi.fn(),
    adminDeleteComment: vi.fn(),
    adminDeleteListing: vi.fn(),
  },
}));

function page(content) {
  return { content, totalPages: 1, totalElements: content.length };
}

describe("Admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn(() => true));
    api.getCurrentUser.mockResolvedValue({ id: 1, username: "demo", role: "ADMIN" });
    api.adminGetUsers.mockResolvedValue(page([{ id: 2, username: "alice", email: "alice@test", role: "USER", acceptedContract: true, walletBalance: 15 }]));
    api.adminGetPosts.mockResolvedValue(page([{ id: 3, authorUsername: "alice", content: "Post test", createdAt: "2026-01-01T10:00:00" }]));
    api.adminGetComments.mockResolvedValue(page([{ id: 4, authorUsername: "alice", postId: 3, postExcerpt: "Post test", content: "Commentaire", createdAt: "2026-01-01T10:01:00" }]));
    api.adminGetListings.mockResolvedValue(page([{ id: 5, sellerUsername: "alice", title: "Vélo", price: 20, status: "AVAILABLE", createdAt: "2026-01-01T10:02:00" }]));
  });

  it("shows users, wallets and moderation collections for an administrator", async () => {
    render(<MemoryRouter><Admin /></MemoryRouter>);

    expect((await screen.findAllByText("alice")).length).toBeGreaterThan(0);
    expect(screen.getByText("Posts")).toBeInTheDocument();
    expect(screen.getByText("Commentaires")).toBeInTheDocument();
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("validates then credits a wallet through the dedicated admin API", async () => {
    api.adminCreditWallet.mockResolvedValue({ userId: 2, balance: 25 });
    render(<MemoryRouter><Admin /></MemoryRouter>);
    const amount = await screen.findByLabelText("Montant wallet alice");
    fireEvent.change(amount, { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Créditer" }));

    await waitFor(() => expect(api.adminCreditWallet).toHaveBeenCalledWith(2, 10));
    expect(await screen.findByText("Wallet crédité.")).toBeInTheDocument();
  });

  it("confirms before deleting moderated content and refreshes its lists", async () => {
    api.adminDeletePost.mockResolvedValue({});
    render(<MemoryRouter><Admin /></MemoryRouter>);
    await screen.findByText("Post test");
    fireEvent.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);

    await waitFor(() => expect(api.adminDeletePost).toHaveBeenCalledWith(3));
    expect(await screen.findByText("Suppression effectuée.")).toBeInTheDocument();
  });
});
