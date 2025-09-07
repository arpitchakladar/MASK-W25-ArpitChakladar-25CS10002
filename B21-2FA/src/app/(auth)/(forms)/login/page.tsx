"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";

export default function LogInPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();
	const { setMessage } = useMessage();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username || !password)
			return setMessage({
				text: "Please enter username and password.",
				type: "error",
			});

		try {
			const res = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();
			if (res.ok) {
				router.push("/otp");
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
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>

			<button type="submit">Log In</button>
		</form>
	);
}
