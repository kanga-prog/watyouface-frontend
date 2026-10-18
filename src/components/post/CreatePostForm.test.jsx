import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreatePostForm from "./CreatePostForm";
import { api } from "../../utils/api";

vi.mock("../../utils/api", () => ({ api: { createPost: vi.fn(), errorMessage: vi.fn() } }));

describe("CreatePostForm image policy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:post-preview"), revokeObjectURL: vi.fn() });
  });

  it("advertises exactly the common backend image formats", () => {
    render(<CreatePostForm />);
    expect(document.querySelector('input[type="file"]')).toHaveAttribute(
      "accept", "image/jpeg,image/png,image/gif,image/bmp,video/mp4,video/webm,video/quicktime"
    );
  });

  it.each([
    ["JPEG", "image/jpeg", "post.jpg"],
    ["PNG", "image/png", "post.png"],
    ["GIF", "image/gif", "post.gif"],
    ["BMP", "image/bmp", "post.bmp"],
  ])("accepts a %s image locally", (_label, type, name) => {
    render(<CreatePostForm />);
    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: { files: [new File(["image"], name, { type })] },
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByAltText("preview")).toBeInTheDocument();
  });

  it("rejects WebP before a post request", () => {
    render(<CreatePostForm />);
    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: { files: [new File(["webp"], "post.webp", { type: "image/webp" })] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Formats acceptés : JPEG, PNG, GIF, BMP ou vidéo MP4/WebM/MOV.");
    expect(api.createPost).not.toHaveBeenCalled();
  });

  it("rejects an image over 10 MB before a post request", () => {
    render(<CreatePostForm />);
    fireEvent.change(document.querySelector('input[type="file"]'), {
      target: { files: [new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.png", { type: "image/png" })] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Image trop volumineuse : 10 Mo maximum.");
    expect(api.createPost).not.toHaveBeenCalled();
  });
});
