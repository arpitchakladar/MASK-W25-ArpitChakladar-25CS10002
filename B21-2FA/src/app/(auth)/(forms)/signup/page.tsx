"use client";

import { useState } from "react";
import { validateSignUp } from "@/lib/validation";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			validateSignUp(username, email, password);
		} catch (err: any) {
			setMessage(`❌ ${err.message}`);
			return;
		}

		try {
			const res = await fetch("/api/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, email, password }),
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
		<form onSubmit={handleSubmit} noValidate>
			<input
				type="text"
				placeholder="Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				required
			/>

			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
			/>

			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>

			<button type="submit">Sign Up</button>

			{message && <p className="">{message}</p>}
		</form>
	);
}
