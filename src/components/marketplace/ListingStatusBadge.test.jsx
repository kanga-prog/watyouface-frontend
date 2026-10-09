import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ListingStatusBadge from "./ListingStatusBadge";

describe("ListingStatusBadge", () => {
  it("uses a comprehensible label for a marketplace lifecycle status", () => {
    render(<ListingStatusBadge status="PENDING" />);
    expect(screen.getByText("Demande en attente")).toBeInTheDocument();
  });

  it("keeps unknown statuses explicit instead of rendering an empty badge", () => {
    render(<ListingStatusBadge status="ARCHIVED" />);
    expect(screen.getByText("ARCHIVED")).toBeInTheDocument();
  });
});
