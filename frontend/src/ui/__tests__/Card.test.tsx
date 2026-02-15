import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Card } from "../Card";

describe("Card", () => {
	it("renders children", () => {
		render(<Card>Card content</Card>);
		expect(screen.getByText("Card content")).toBeInTheDocument();
	});

	it("applies custom className", () => {
		render(
			<Card className="test-class" data-testid="card">
				Content
			</Card>,
		);
		expect(screen.getByTestId("card")).toHaveClass("test-class");
	});

	it("renders with data-testid", () => {
		render(<Card data-testid="my-card">Content</Card>);
		expect(screen.getByTestId("my-card")).toBeInTheDocument();
	});

	it("passes through HTML attributes", async () => {
		const handleClick = vi.fn();
		render(
			<Card data-testid="card" onClick={handleClick}>
				Click me
			</Card>,
		);
		screen.getByTestId("card").click();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("renders with isPressable prop", () => {
		render(
			<Card isPressable data-testid="card">
				Pressable
			</Card>,
		);
		expect(screen.getByTestId("card")).toBeInTheDocument();
	});
});
