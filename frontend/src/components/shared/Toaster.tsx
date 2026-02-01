"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
	return (
		<HotToaster
			position="bottom-right"
			reverseOrder={false}
			toastOptions={{
				className: "!p-0 !bg-transparent !border-none !shadow-none",
				style: {
					background: "transparent",
					padding: "0",
					margin: "0",
				},
			}}
			containerStyle={{
				bottom: "24px",
				right: "24px",
			}}
		/>
	);
}
