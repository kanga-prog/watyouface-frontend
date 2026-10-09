import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ChatList from "./ChatList";

describe("ChatList", () => {
  it("renders an explicit empty state", () => {
    render(<ChatList conversations={[]} users={[]} onSelect={vi.fn()} onAvatarClick={vi.fn()} />);
    expect(screen.getByText("Aucune conversation pour le moment.")).toBeInTheDocument();
  });

  it("uses a real button to select a conversation", () => {
    const onSelect = vi.fn();
    render(
      <ChatList
        conversations={[{ id: 12, participants: [{ id: 1, username: "Alice" }, { id: 2, username: "Bruno" }] }]}
        users={[]}
        currentUserId={1}
        onSelect={onSelect}
        onAvatarClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Bruno/i }));
    expect(onSelect).toHaveBeenCalledWith(12);
  });
});
