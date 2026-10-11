import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
const mocks = vi.hoisted(() => ({ analyticsSummary: vi.fn() }));
vi.mock("../api/collaboration", () => ({ analyticsSummary: mocks.analyticsSummary })); vi.mock("../components/TopBar", () => ({ default: ({ title }) => <h1>{title}</h1> }));
import Analytics from "./Analytics";
describe("Analytics", () => { beforeEach(() => mocks.analyticsSummary.mockResolvedValue({ data: { totalBoards: 1, totalVotes: 4, boardsWithVotes: 1, closedBoards: 0, categoryVotes: {}, pollTypes: {}, optionPopularity: { A: 4 }, communityActivity: {}, decisionTrends: {}, outcomes: {}, mostActive: [] } })); it("renders extended analytics", async () => { render(<Analytics />); expect(await screen.findByText("Option popularity")).toBeTruthy(); expect(screen.getByText("Decision outcomes")).toBeTruthy(); }); });
