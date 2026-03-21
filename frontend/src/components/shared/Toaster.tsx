"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
	return (
		<section aria-label="Notifications">
			<SonnerToaster
				position="bottom-right"
				theme="dark"
				toastOptions={{
					className:
						"!bg-content1/30 !backdrop-blur-xl !border !border-white/20 !text-foreground !rounded-xl !shadow-2xl",
				}}
			/>
		</section>
	);
}
