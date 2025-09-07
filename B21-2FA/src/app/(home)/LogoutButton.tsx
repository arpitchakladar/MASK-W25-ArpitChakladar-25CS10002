"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
	const router = useRouter();

	const handleLogout = async () => {
		await fetch("/api/logout", { method: "POST" });
		router.push("/");
	};

	return (
		<button onClick={handleLogout} className="button">
			Log Out
		</button>
	);
}
