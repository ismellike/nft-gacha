import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { expectNoA11yViolations } from "../../test/axe-helper";
import { Badge } from "../Badge";

describe("Badge", () => {
	it("renders children", () => {
		render(
			<Badge count={5}>
				<button type="button">Notifications</button>
			</Badge>,
		);
		expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
	});

	it("renders count badge when count > 0", () => {
		render(
			<Badge count={7}>
				<span>Icon</span>
			</Badge>,
		);
		expect(screen.getByText("7")).toBeInTheDocument();
	});

	it("does not render badge when count is 0", () => {
		render(
			<Badge count={0}>
				<span>Icon</span>
			</Badge>,
		);
		expect(screen.queryByText("0")).not.toBeInTheDocument();
	});

	it("truncates count above max to 99+", () => {
		render(
			<Badge count={150} max={99}>
				<span>Icon</span>
			</Badge>,
		);
		expect(screen.getByText("99+")).toBeInTheDocument();
	});

	it("truncates count above custom max", () => {
		render(
			<Badge count={25} max={9}>
				<span>Icon</span>
			</Badge>,
		);
		expect(screen.getByText("9+")).toBeInTheDocument();
	});

	it("renders dot mode without number", () => {
		const { container } = render(
			<Badge dot>
				<span>Icon</span>
			</Badge>,
		);
		const badge = container.querySelector("[aria-label='Notification']");
		expect(badge).toBeInTheDocument();
		// Dot mode should have no number text
		expect(badge?.textContent).toBe("");
	});

	it("renders dot mode even when count is provided", () => {
		const { container } = render(
			<Badge dot count={10}>
				<span>Icon</span>
			</Badge>,
		);
		const badge = container.querySelector("[aria-label='Notification']");
		expect(badge).toBeInTheDocument();
		expect(badge?.textContent).toBe("");
	});

	it("renders with each color variant", () => {
		const colors = [
			"primary",
			"secondary",
			"danger",
			"success",
			"warning",
			"ghost",
		] as const;

		for (const color of colors) {
			const { unmount } = render(
				<Badge count={1} color={color}>
					<span>{color}</span>
				</Badge>,
			);
			expect(screen.getByText("1")).toBeInTheDocument();
			unmount();
		}
	});

	it("applies badgeClassName to the badge element", () => {
		const { container } = render(
			<Badge count={3} badgeClassName="custom-badge">
				<span>Icon</span>
			</Badge>,
		);
		const badge = container.querySelector(".custom-badge");
		expect(badge).toBeInTheDocument();
	});

	it("applies className to the wrapper", () => {
		const { container } = render(
			<Badge count={3} className="custom-wrapper">
				<span>Icon</span>
			</Badge>,
		);
		expect(container.firstChild).toHaveClass("custom-wrapper");
	});

	it("provides aria-label with count for screen readers", () => {
		const { container } = render(
			<Badge count={5}>
				<span>Icon</span>
			</Badge>,
		);
		const badge = container.querySelector("[aria-label]");
		expect(badge).toHaveAttribute("aria-label", "5 notifications");
	});

	it("has no accessibility violations with count badge", async () => {
		const { container } = render(
			<Badge count={3}>
				<button type="button">Messages</button>
			</Badge>,
		);
		await expectNoA11yViolations(container);
	});

	it("has no accessibility violations with dot badge", async () => {
		const { container } = render(
			<Badge dot>
				<button type="button">Alerts</button>
			</Badge>,
		);
		await expectNoA11yViolations(container);
	});
});
