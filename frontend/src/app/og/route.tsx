import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	const title = searchParams.get("title") || "SPINFI";
	const description = searchParams.get("description") || "Provably Fair NFT Gacha";

	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#0a0a0a",
					backgroundImage:
						"linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
					fontSize: 60,
					fontWeight: "bold",
				}}
			>
				<div
					style={{
						color: "white",
						marginBottom: 40,
						fontSize: "64px",
						fontWeight: "800",
					}}
				>
					{title}
				</div>
				<div
					style={{
						color: "rgba(255,255,255,0.8)",
						fontSize: "32px",
						maxWidth: "1000px",
						textAlign: "center",
						fontWeight: "400",
					}}
				>
					{description}
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
		},
	);
}
