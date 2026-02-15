import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Modal, ModalContent, ModalBody, DialogTitle } from "../Modal";

const TestModal = ({
	isOpen = true,
	onClose,
	onOpenChange,
	hideCloseButton = false,
}: {
	isOpen?: boolean | undefined;
	onClose?: (() => void) | undefined;
	onOpenChange?: ((open: boolean) => void) | undefined;
	hideCloseButton?: boolean | undefined;
}) => (
	<Modal
		isOpen={isOpen}
		hideCloseButton={hideCloseButton}
		{...(onClose !== undefined ? { onClose } : {})}
		{...(onOpenChange !== undefined ? { onOpenChange } : {})}
	>
		<ModalContent>
			<DialogTitle>Test Title</DialogTitle>
			<ModalBody>Test Body</ModalBody>
		</ModalContent>
	</Modal>
);

describe("Modal", () => {
	it("renders content when open", () => {
		render(<TestModal isOpen={true} />);
		expect(screen.getByText("Test Title")).toBeInTheDocument();
		expect(screen.getByText("Test Body")).toBeInTheDocument();
	});

	it("does not render content when closed", () => {
		render(<TestModal isOpen={false} />);
		expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
	});

	it("calls onClose when close button is clicked", async () => {
		const onClose = vi.fn();
		render(<TestModal onClose={onClose} />);

		const closeButton = screen.getByLabelText("Close");
		await userEvent.click(closeButton);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("calls onOpenChange when close button is clicked", async () => {
		const onOpenChange = vi.fn();
		render(<TestModal onOpenChange={onOpenChange} />);

		const closeButton = screen.getByLabelText("Close");
		await userEvent.click(closeButton);
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("hides close button when hideCloseButton is true", () => {
		render(<TestModal hideCloseButton={true} />);
		expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
	});

	it("has role=dialog", () => {
		render(<TestModal />);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});
});
