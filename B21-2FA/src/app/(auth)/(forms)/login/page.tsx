"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogInPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username || !password)
			return setMessage("Please enter username and password.");

		try {
			const res = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();
			if (res.ok) {
				setMessage(`✅ ${data.message}`);
				router.push("/otp");
			} else {
				setMessage(`❌ ${data.message}`);
			}
		} catch (err) {
			setMessage("⚠️ Something went wrong");
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

			{message && <p>{message}</p>}
		</form>
	);
}
