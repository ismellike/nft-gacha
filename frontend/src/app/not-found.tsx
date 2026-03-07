import {
	ArrowLeftIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button, Card } from "../ui";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl p-8 text-center bg-content1/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
				<div className="mx-auto w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mb-6">
					<MagnifyingGlassIcon className="w-8 h-8 text-foreground/60" />
				</div>

				<h1 className="text-2xl font-semibold text-foreground mb-3">
					Page Not Found
				</h1>

				<p className="text-foreground/70 mb-8 leading-relaxed">
					The page you&apos;re looking for doesn&apos;t exist or has been moved.
				</p>

				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Link href="/discover">
						<Button
							color="glassPrimary"
							startContent={<ArrowLeftIcon className="w-4 h-4" />}
						>
							Back to Discovery
						</Button>
					</Link>

					<Link href="/gacha">
						<Button color="glass">Go to Gacha</Button>
					</Link>
				</div>
			</Card>
		</div>
	);
}
