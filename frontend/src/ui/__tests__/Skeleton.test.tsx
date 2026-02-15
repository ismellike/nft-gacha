import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton, CardSkeleton, ListSkeleton } from "../Skeleton";

describe("Skeleton", () => {
	it("renders with default variant", () => {
		render(<Skeleton data-testid="skel" />);
		const el = screen.getByTestId("skel");
		expect(el).toBeInTheDocument();
		expect(el.className).toContain("animate-pulse");
	});

	it("renders circle variant with rounded-full", () => {
		render(<Skeleton variant="circle" data-testid="skel" />);
		expect(screen.getByTestId("skel").className).toContain("rounded-full");
	});

	it("renders text variant", () => {
		render(<Skeleton variant="text" data-testid="skel" />);
		expect(screen.getByTestId("skel")).toBeInTheDocument();
	});

	it("applies custom className", () => {
		render(<Skeleton className="custom" data-testid="skel" />);
		expect(screen.getByTestId("skel")).toHaveClass("custom");
	});

	it("renders children", () => {
		render(
			<Skeleton data-testid="skel">
				<span>Loading</span>
			</Skeleton>,
		);
		expect(screen.getByText("Loading")).toBeInTheDocument();
	});
});

describe("CardSkeleton", () => {
	it("renders without errors", () => {
		const { container } = render(<CardSkeleton />);
		expect(container.firstChild).toBeTruthy();
	});

	it("renders custom children", () => {
		render(<CardSkeleton>Custom content</CardSkeleton>);
		expect(screen.getByText("Custom content")).toBeInTheDocument();
	});
});

describe("ListSkeleton", () => {
	it("renders default 3 items", () => {
		const { container } = render(<ListSkeleton />);
		const items = container.querySelectorAll("[class*='flex items-center']");
		expect(items.length).toBe(3);
	});

	it("renders specified number of items", () => {
		const { container } = render(<ListSkeleton items={2} />);
		const items = container.querySelectorAll("[class*='flex items-center']");
		expect(items.length).toBe(2);
	});
});
