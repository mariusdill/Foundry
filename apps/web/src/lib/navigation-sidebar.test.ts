import { describe, expect, it } from "vitest";

import {
	primaryNavigation,
	sidebarActionSurfaces,
	sidebarCollections,
} from "./navigation";

describe("sidebar navigation data", () => {
	it("preserves the MVP primary destinations in order", () => {
		expect(primaryNavigation.map((item) => item.href)).toEqual([
			"/",
			"/search",
			"/drafts",
			"/spaces",
		]);
	});

	it("provides local-data-backed action and collection sections", () => {
		expect(sidebarActionSurfaces.length).toBeGreaterThan(0);
		expect(sidebarCollections.map((section) => section.title)).toEqual([
			"Recent work",
			"Pinned pages",
		]);
		expect(
			sidebarCollections.every((section) => section.items.length > 0),
		).toBe(true);
	});
});
