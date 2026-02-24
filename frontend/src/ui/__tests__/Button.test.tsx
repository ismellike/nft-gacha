import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { expectNoA11yViolations } from "../../test/axe-helper";
import { Button } from "../Button";

describe("Button", () => {
	it("renders with text content", () => {
		render(<Button>Click me</Button>);
		expect(
			screen.getByRole("button", { name: "Click me" }),
		).toBeInTheDocument();
	});

	it("fires onClick handler", async () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click</Button>);

		await userEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("fires onPress handler", async () => {
		const handlePress = vi.fn();
		render(<Button onPress={handlePress}>Press</Button>);

		await userEvent.click(screen.getByRole("button"));
		expect(handlePress).toHaveBeenCalledTimes(1);
	});

	it("disabled state prevents click", async () => {
		const handleClick = vi.fn();
		render(
			<Button disabled onClick={handleClick}>
				Disabled
			</Button>,
		);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		await userEvent.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("isDisabled prop disables button", () => {
		render(<Button isDisabled>Disabled</Button>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("isLoading disables button and sets aria-busy", () => {
		render(<Button isLoading>Loading</Button>);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		expect(button).toHaveAttribute("aria-busy", "true");
	});

	it("renders startContent", () => {
		render(
			<Button startContent={<span data-testid="icon">S</span>}>Text</Button>,
		);
		expect(screen.getByTestId("icon")).toBeInTheDocument();
	});

	it("renders endContent", () => {
		render(
			<Button endContent={<span data-testid="end-icon">E</span>}>Text</Button>,
		);
		expect(screen.getByTestId("end-icon")).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		const { container } = render(<Button>Accessible</Button>);
		await expectNoA11yViolations(container);
	});
});
