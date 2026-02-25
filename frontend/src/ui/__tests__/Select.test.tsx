import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { expectNoA11yViolations } from "../../test/axe-helper";
import { Select } from "../Select";

const defaultOptions = [
	{ value: "a", label: "Option A" },
	{ value: "b", label: "Option B" },
	{ value: "c", label: "Option C" },
];

describe("Select", () => {
	it("renders a select element", () => {
		render(<Select options={defaultOptions} />);
		expect(screen.getByRole("combobox")).toBeInTheDocument();
	});

	it("renders all options", () => {
		render(<Select options={defaultOptions} />);
		expect(screen.getByRole("option", { name: "Option A" })).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "Option B" })).toBeInTheDocument();
		expect(screen.getByRole("option", { name: "Option C" })).toBeInTheDocument();
	});

	it("renders placeholder as first disabled option", () => {
		render(<Select options={defaultOptions} placeholder="Choose one" />);
		const placeholder = screen.getByRole("option", { name: "Choose one" });
		expect(placeholder).toBeInTheDocument();
		expect(placeholder).toBeDisabled();
	});

	it("renders a label when provided", () => {
		render(<Select options={defaultOptions} label="Pick a color" />);
		expect(screen.getByText("Pick a color")).toBeInTheDocument();
	});

	it("associates label with select via htmlFor", () => {
		render(<Select options={defaultOptions} label="Type" id="type-field" />);
		const label = screen.getByText("Type");
		expect(label).toHaveAttribute("for", "type-field");
	});

	it("renders helperText below the select", () => {
		render(<Select options={defaultOptions} helperText="Select your preference" />);
		expect(screen.getByText("Select your preference")).toBeInTheDocument();
	});

	it("renders errorMessage and sets aria-invalid", () => {
		render(<Select options={defaultOptions} errorMessage="Selection required" />);
		expect(screen.getByText("Selection required")).toBeInTheDocument();
		expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
	});

	it("errorMessage overrides helperText", () => {
		render(
			<Select
				options={defaultOptions}
				helperText="Helper text"
				errorMessage="Error message"
			/>,
		);
		expect(screen.getByText("Error message")).toBeInTheDocument();
		expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
	});

	it("disabled state disables the select", () => {
		render(<Select options={defaultOptions} disabled />);
		expect(screen.getByRole("combobox")).toBeDisabled();
	});

	it("renders a disabled option when option.disabled is true", () => {
		const opts = [
			{ value: "x", label: "Option X", disabled: true },
			{ value: "y", label: "Option Y" },
		];
		render(<Select options={opts} />);
		expect(screen.getByRole("option", { name: "Option X" })).toBeDisabled();
		expect(screen.getByRole("option", { name: "Option Y" })).not.toBeDisabled();
	});

	it("fires onChange when selection changes", async () => {
		const handleChange = vi.fn();
		render(<Select options={defaultOptions} onChange={handleChange} />);

		const select = screen.getByRole("combobox");
		select.dispatchEvent(new Event("change", { bubbles: true }));
		expect(handleChange).toHaveBeenCalled();
	});

	it("applies custom className to select element", () => {
		render(<Select options={defaultOptions} className="custom-select" />);
		expect(screen.getByRole("combobox")).toHaveClass("custom-select");
	});

	it("forwards ref to select element", () => {
		const ref = { current: null as HTMLSelectElement | null };
		render(<Select options={defaultOptions} ref={ref} />);
		expect(ref.current).not.toBeNull();
		expect(ref.current?.tagName).toBe("SELECT");
	});

	it("renders with each variant", () => {
		const variants = ["default", "ghost", "error"] as const;
		for (const variant of variants) {
			const { unmount } = render(
				<Select options={defaultOptions} variant={variant} aria-label={variant} />,
			);
			expect(screen.getByRole("combobox")).toBeInTheDocument();
			unmount();
		}
	});

	it("renders with each size", () => {
		const sizes = ["sm", "md", "lg"] as const;
		for (const size of sizes) {
			const { unmount } = render(
				<Select options={defaultOptions} size={size} aria-label={size} />,
			);
			expect(screen.getByRole("combobox")).toBeInTheDocument();
			unmount();
		}
	});

	it("has no accessibility violations", async () => {
		const { container } = render(
			<Select options={defaultOptions} label="Accessible select" />,
		);
		await expectNoA11yViolations(container);
	});
});
