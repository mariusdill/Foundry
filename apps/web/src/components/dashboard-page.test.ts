import { describe, expect, it } from "vitest";

import * as dashboardOverview from "./dashboard-overview";

type DashboardActivitySummary = {
	title: string;
	detail: string;
	href?: string;
	tone: "human" | "agent" | "neutral";
};

describe("dashboard activity summaries", () => {
	it("builds a page activity summary with actor and page context", () => {
		expect("buildDashboardActivitySummary" in dashboardOverview).toBe(true);

		const buildDashboardActivitySummary = (
			dashboardOverview as typeof dashboardOverview & {
				buildDashboardActivitySummary: (input: {
					action: string;
					actorType: "human" | "agent";
					actorName?: string | null;
					targetId: string;
					targetType: string;
					metadata?: Record<string, unknown> | null;
					page?: {
						id: string;
						title: string;
						path: string;
						space: { name: string };
					} | null;
				}) => DashboardActivitySummary;
			}
		).buildDashboardActivitySummary;

		expect(
			buildDashboardActivitySummary({
				action: "page:update",
				actorType: "human",
				actorName: "Foundry Admin",
				targetId: "page-1",
				targetType: "page",
				page: {
					id: "page-1",
					title: "Incident Response Playbook",
					path: "incidents/response-playbook",
					space: { name: "Infrastructure Runbooks" },
				},
			}),
		).toEqual({
			title: "Foundry Admin updated Incident Response Playbook",
			detail: "Infrastructure Runbooks / incidents/response-playbook",
			href: "/pages/page-1",
			tone: "human",
		});
	});

	it("falls back to metadata for space activity when no page is attached", () => {
		expect("buildDashboardActivitySummary" in dashboardOverview).toBe(true);

		const buildDashboardActivitySummary = (
			dashboardOverview as typeof dashboardOverview & {
				buildDashboardActivitySummary: (input: {
					action: string;
					actorType: "human" | "agent";
					actorName?: string | null;
					targetId: string;
					targetType: string;
					metadata?: Record<string, unknown> | null;
					page?: {
						id: string;
						title: string;
						path: string;
						space: { name: string };
					} | null;
				}) => DashboardActivitySummary;
			}
		).buildDashboardActivitySummary;

		expect(
			buildDashboardActivitySummary({
				action: "space:create",
				actorType: "agent",
				actorName: null,
				targetId: "space-1",
				targetType: "space",
				metadata: {
					name: "Operations Runbooks",
				},
			}),
		).toEqual({
			title: "Agent created Operations Runbooks",
			detail: "Space created",
			href: "/spaces/space-1",
			tone: "agent",
		});
	});
});
