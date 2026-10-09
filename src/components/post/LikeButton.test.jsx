import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LikeButton from "./LikeButton";
import { api } from "../../utils/api";

vi.mock("../../utils/api", () => ({ api: { toggleLike: vi.fn() } }));

describe("LikeButton", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not offer a self-like action when it is disabled by ownership", () => {
    render(<LikeButton postId={1} initialLikeCount={3} initialLiked={false} disabled disabledReason="Vous ne pouvez pas aimer votre propre publication." />);

    const button = screen.getByRole("button", { name: /propre publication/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(api.toggleLike).not.toHaveBeenCalled();
  });

  it("calls the API and updates the visible count for an eligible post", async () => {
    api.toggleLike.mockResolvedValue({});
    render(<LikeButton postId={2} initialLikeCount={0} initialLiked={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Aimer cette publication" }));
    await waitFor(() => expect(api.toggleLike).toHaveBeenCalledWith({ postId: 2, videoId: null }));
    expect(screen.getByText("J’aime (1)")).toBeInTheDocument();
  });
});
