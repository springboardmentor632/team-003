import { describe, expect, it, vi } from "vitest";
import { topTwo, timeAgo } from "./decisionHelpers";

describe("topTwo", () => {
  it("orders options and returns percentages that total 100", () => {
    const result = topTwo({ options: [{ id: 1, voteCount: 2 }, { id: 2, voteCount: 6 }, { id: 3, voteCount: 1 }] });
    expect(result.a.id).toBe(2);
    expect(result.b.id).toBe(1);
    expect(result.pctA).toBe(75);
    expect(result.pctB).toBe(25);
  });

  it("is safe when no options have votes", () => {
    expect(topTwo({ options: [] })).toMatchObject({ pctA: 0, pctB: 0 });
  });
});

describe("timeAgo", () => {
  it("formats a recent timestamp", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-25T10:00:00Z"));
    expect(timeAgo("2026-09-25T09:58:00Z")).toBe("2 minutes ago");
    vi.useRealTimers();
  });
});
