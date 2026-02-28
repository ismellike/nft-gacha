import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { expectNoA11yViolations } from "../../test/axe-helper";
import { Input } from "../Input";

describe("Input", () => {
	it("renders a text input", () => {
		render(<Input placeholder="Enter value" />);
		expect(screen.getByPlaceholderText("Enter value")).toBeInTheDocument();
	});

	it("renders a label when provided", () => {
		render(<Input label="Username" />);
		expect(screen.getByText("Username")).toBeInTheDocument();
	});

	it("associates label with input via htmlFor", () => {
		render(<Input label="Email" id="email-field" />);
		const label = screen.getByText("Email");
		expect(label).toHaveAttribute("for", "email-field");
	});

	it("renders helperText below the input", () => {
		render(<Input helperText="Must be at least 8 characters" />);
		expect(
			screen.getByText("Must be at least 8 characters"),
		).toBeInTheDocument();
	});

	it("renders errorMessage and sets aria-invalid", () => {
		render(<Input errorMessage="This field is required" />);
		expect(screen.getByText("This field is required")).toBeInTheDocument();
		expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
	});

	it("errorMessage overrides helperText", () => {
		render(<Input helperText="Helper" errorMessage="Error occurred" />);
		expect(screen.getByText("Error occurred")).toBeInTheDocument();
		expect(screen.queryByText("Helper")).not.toBeInTheDocument();
	});

	it("renders leftIcon", () => {
		render(<Input leftIcon={<span data-testid="left-icon">$</span>} />);
		expect(screen.getByTestId("left-icon")).toBeInTheDocument();
	});

	it("renders rightIcon", () => {
		render(<Input rightIcon={<span data-testid="right-icon">@</span>} />);
		expect(screen.getByTestId("right-icon")).toBeInTheDocument();
	});

	it("disabled state", () => {
		render(<Input disabled placeholder="Disabled" />);
		expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
	});

	it("fires onChange handler", async () => {
		const handleChange = vi.fn();
		render(<Input onChange={handleChange} placeholder="Type here" />);

		await userEvent.type(screen.getByPlaceholderText("Type here"), "hello");
		expect(handleChange).toHaveBeenCalled();
	});

	it("applies custom className", () => {
		render(<Input className="custom-input" placeholder="test" />);
		expect(screen.getByPlaceholderText("test")).toHaveClass("custom-input");
	});

	it("applies wrapperClassName to wrapper div", () => {
		render(
			<Input
				wrapperClassName="custom-wrapper"
				placeholder="test"
				data-testid="input"
			/>,
		);
		const wrapper = screen.getByTestId("input").closest(".custom-wrapper");
		expect(wrapper).toBeInTheDocument();
	});

	it("forwards ref to input element", () => {
		const ref = { current: null as HTMLInputElement | null };
		render(<Input ref={ref} placeholder="ref test" />);
		expect(ref.current).not.toBeNull();
		expect(ref.current?.tagName).toBe("INPUT");
	});

	it("renders with each variant", () => {
		const variants = ["default", "ghost", "error"] as const;
		for (const variant of variants) {
			const { unmount } = render(
				<Input variant={variant} placeholder={variant} />,
			);
			expect(screen.getByPlaceholderText(variant)).toBeInTheDocument();
			unmount();
		}
	});

	it("renders with each size", () => {
		const sizes = ["sm", "md", "lg"] as const;
		for (const size of sizes) {
			const { unmount } = render(<Input size={size} placeholder={size} />);
			expect(screen.getByPlaceholderText(size)).toBeInTheDocument();
			unmount();
		}
	});

	it("has no accessibility violations", async () => {
		const { container } = render(
			<Input label="Accessible field" placeholder="Enter text" />,
		);
		await expectNoA11yViolations(container);
	});
});
