import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Marketplace from "./Marketplace";
import Messages from "./Messages";
import { api } from "../utils/api";

vi.mock("../utils/api", () => ({
  api: {
    getProfile: vi.fn(),
    getConversations: vi.fn(),
    getUsers: vi.fn(),
  },
}));

vi.mock("../components/marketplace/MarketplaceSidebar", () => ({
  default: ({ onOpenChat }) => (
    <button type="button" onClick={() => onOpenChat(42)}>Contacter le vendeur test</button>
  ),
}));

vi.mock("../components/chat/ChatList", () => ({ default: () => null }));
vi.mock("../components/chat/ChatWindow", () => ({
  default: ({ convId }) => <span data-testid="active-conversation">{convId}</span>,
}));

describe("Marketplace seller contact flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getProfile.mockResolvedValue({ id: 2, username: "Buyer Demo" });
    api.getConversations.mockResolvedValue([{ id: 42, participants: [] }]);
    api.getUsers.mockResolvedValue([{ id: 1, username: "Seller Demo" }]);
  });

  it("navigates to Chat with the private seller conversation returned by the API", async () => {
    render(
      <MemoryRouter initialEntries={["/marketplace"]}>
        <Routes>
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Contacter le vendeur test" }));

    expect(await screen.findByTestId("active-conversation")).toHaveTextContent("42");
  });
});
