import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChatWindow from "./ChatWindow";
import { api } from "../../utils/api";

vi.mock("../../utils/api", () => ({
  api: { fetchConversationMessages: vi.fn() },
}));

vi.mock("../../utils/chatApi", () => ({
  connect: vi.fn(),
  subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
  sendMessage: vi.fn(),
}));

vi.mock("./MessageForm", () => ({
  default: () => <form aria-label="Message form" />,
}));

describe("ChatWindow message timestamps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchConversationMessages.mockResolvedValue([
      {
        id: 1,
        content: "Message de démonstration",
        senderUsername: "Alice Demo",
        sentAt: "2026-10-08T10:34:00Z",
      },
    ]);
  });

  it("formats the API's sentAt timestamp", async () => {
    render(<ChatWindow convId={1} jwtToken="demo-token" username="Alice Demo" />);

    await screen.findByText("Message de démonstration");
    expect(document.querySelector("time")?.textContent).toMatch(/\d{2}:\d{2}/);
    expect(document.body).not.toHaveTextContent("Invalid Date");
  });

  it("omits the timestamp when sentAt is absent", async () => {
    api.fetchConversationMessages.mockResolvedValueOnce([
      { id: 2, content: "Sans date", senderUsername: "Alice Demo" },
    ]);
    render(<ChatWindow convId={1} jwtToken="demo-token" username="Alice Demo" />);

    await screen.findByText("Sans date");
    expect(document.querySelector("time")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("Invalid Date");
  });

  it("omits an invalid sentAt value instead of rendering Invalid Date", async () => {
    api.fetchConversationMessages.mockResolvedValueOnce([
      { id: 3, content: "Date invalide", senderUsername: "Alice Demo", sentAt: "not-a-date" },
    ]);
    render(<ChatWindow convId={1} jwtToken="demo-token" username="Alice Demo" />);

    await screen.findByText("Date invalide");
    expect(document.querySelector("time")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("Invalid Date");
  });
});
