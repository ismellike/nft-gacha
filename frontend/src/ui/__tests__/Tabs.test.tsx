import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { expectNoA11yViolations } from "../../test/axe-helper";
import { Tabs } from "../Tabs";

const defaultTabs = [
	{ label: "Overview", value: "overview" },
	{ label: "History", value: "history" },
	{ label: "Settings", value: "settings" },
];

describe("Tabs", () => {
	it("renders all tabs", () => {
		render(<Tabs tabs={defaultTabs} activeTab="overview" onChange={vi.fn()} />);
		expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "History" })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "Settings" })).toBeInTheDocument();
	});

	it("marks activeTab as aria-selected", () => {
		render(<Tabs tabs={defaultTabs} activeTab="history" onChange={vi.fn()} />);
		expect(screen.getByRole("tab", { name: "History" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
			"aria-selected",
			"false",
		);
	});

	it("calls onChange with correct value when tab is clicked", async () => {
		const handleChange = vi.fn();
		render(
			<Tabs tabs={defaultTabs} activeTab="overview" onChange={handleChange} />,
		);

		await userEvent.click(screen.getByRole("tab", { name: "History" }));
		expect(handleChange).toHaveBeenCalledWith("history");
	});

	it("does not call onChange when disabled tab is clicked", async () => {
		const handleChange = vi.fn();
		const tabs = [
			...defaultTabs,
			{ label: "Locked", value: "locked", disabled: true },
		];
		render(<Tabs tabs={tabs} activeTab="overview" onChange={handleChange} />);

		await userEvent.click(screen.getByRole("tab", { name: "Locked" }));
		expect(handleChange).not.toHaveBeenCalledWith("locked");
	});

	it("disabled tab has aria-disabled attribute", () => {
		const tabs = [
			...defaultTabs,
			{ label: "Disabled", value: "disabled", disabled: true },
		];
		render(<Tabs tabs={tabs} activeTab="overview" onChange={vi.fn()} />);
		expect(screen.getByRole("tab", { name: "Disabled" })).toHaveAttribute(
			"aria-disabled",
			"true",
		);
	});

	it("renders icon when provided", () => {
		const tabs = [
			{
				label: "With Icon",
				value: "icon",
				icon: <span data-testid="tab-icon">I</span>,
			},
		];
		render(<Tabs tabs={tabs} activeTab="icon" onChange={vi.fn()} />);
		expect(screen.getByTestId("tab-icon")).toBeInTheDocument();
	});

	it("applies custom className", () => {
		const { container } = render(
			<Tabs
				tabs={defaultTabs}
				activeTab="overview"
				onChange={vi.fn()}
				className="custom-tabs"
			/>,
		);
		expect(container.firstChild).toHaveClass("custom-tabs");
	});

	it("has tablist role with aria-label", () => {
		render(<Tabs tabs={defaultTabs} activeTab="overview" onChange={vi.fn()} />);
		expect(screen.getByRole("tablist")).toBeInTheDocument();
	});

	it("has no accessibility violations", async () => {
		const { container } = render(
			<Tabs tabs={defaultTabs} activeTab="overview" onChange={vi.fn()} />,
		);
		await expectNoA11yViolations(container);
	});
});
