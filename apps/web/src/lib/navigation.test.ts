import { describe, expect, it } from "vitest";

import * as navigation from "./navigation";

type AppChromeState = {
	breadcrumbs: Array<{ label: string; href?: string }>;
	title: string;
};

describe("navigation app chrome", () => {
	it("derives default chrome metadata for top-level and nested app routes", () => {
		expect("getAppChromeState" in navigation).toBe(true);

		const getAppChromeState = (
			navigation as typeof navigation & {
				getAppChromeState: (pathname: string) => AppChromeState;
			}
		).getAppChromeState;

		expect(getAppChromeState("/search")).toEqual({
			breadcrumbs: [{ label: "Workspace", href: "/" }, { label: "Search" }],
			title: "Search",
		});

		expect(getAppChromeState("/pages/abc/edit")).toEqual({
			breadcrumbs: [
				{ label: "Workspace", href: "/" },
				{ label: "Pages", href: "/pages/abc" },
				{ label: "Edit" },
			],
			title: "Edit page",
		});
	});

	it("prefers registered route overrides when page data is available", () => {
		expect("resolveAppChromeState" in navigation).toBe(true);

		const resolveAppChromeState = (
			navigation as typeof navigation & {
				resolveAppChromeState: (
					pathname: string,
					override?: Partial<AppChromeState>,
				) => AppChromeState;
			}
		).resolveAppChromeState;

		expect(
			resolveAppChromeState("/pages/abc", {
				title: "Incident playbook refresh",
				breadcrumbs: [
					{ label: "Workspace", href: "/" },
					{ label: "Operations", href: "/spaces/ops" },
					{ label: "Incident playbook refresh" },
				],
			}),
		).toEqual({
			title: "Incident playbook refresh",
			breadcrumbs: [
				{ label: "Workspace", href: "/" },
				{ label: "Operations", href: "/spaces/ops" },
				{ label: "Incident playbook refresh" },
			],
		});
	});
});
