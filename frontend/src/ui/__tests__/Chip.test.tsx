import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { expectNoA11yViolations } from "../../test/axe-helper";
import { Chip } from "../Chip";

describe("Chip", () => {
	it("renders with text content", () => {
		render(<Chip>Common</Chip>);
		expect(screen.getByText("Common")).toBeInTheDocument();
	});

	it("renders with each color variant", () => {
		const colors = [
			"glass",
			"primary",
			"secondary",
			"success",
			"warning",
			"danger",
			"ghost",
		] as const;

		for (const color of colors) {
			const { unmount } = render(<Chip color={color}>{color}</Chip>);
			expect(screen.getByText(color)).toBeInTheDocument();
			unmount();
		}
	});

	it("renders startContent", () => {
		render(<Chip startContent={<span data-testid="dot">O</span>}>Label</Chip>);
		expect(screen.getByTestId("dot")).toBeInTheDocument();
	});

	it("renders endContent", () => {
		render(<Chip endContent={<span data-testid="close">X</span>}>Tag</Chip>);
		expect(screen.getByTestId("close")).toBeInTheDocument();
	});

	it("applies custom className", () => {
		render(
			<Chip className="custom-class" data-testid="chip">
				Test
			</Chip>,
		);
		expect(screen.getByTestId("chip")).toHaveClass("custom-class");
	});

	it("has no accessibility violations", async () => {
		const { container } = render(<Chip>Accessible</Chip>);
		await expectNoA11yViolations(container);
	});
});
