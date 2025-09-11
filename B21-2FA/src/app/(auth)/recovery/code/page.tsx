"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";

export default function RecoveryCodePage() {
	const [username, setUsername] = useState("");
	const [recoveryCode, setRecoveryCode] = useState("");
	const router = useRouter();
	const { setMessage } = useMessage();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!recoveryCode)
			return setMessage({
				text: "Please enter recoveryCode.",
				type: "error",
			});

		try {
			const res = await fetch("/api/recovery/Code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ recoveryCode }),
			});

			const data = await res.json();
			if (res.ok) {
				router.push("/otp/login");
			} else {
				return setMessage({
					text: data.message,
					type: "error",
				});
			}
		} catch (err) {
			return setMessage({
				text: "Something went wrong.",
				type: "error",
			});
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				type="text"
				placeholder="Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				required
			/>
			<input
				type="text"
				placeholder="Recovery Code"
				value={recoveryCode}
				onChange={(e) => setRecoveryCode(e.target.value)}
				required
			/>

			<button type="submit">Use Recovery Code</button>
		</form>
	);
}
