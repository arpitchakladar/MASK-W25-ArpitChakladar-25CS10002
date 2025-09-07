"use client";
import { useState } from "react";
import { validateSignUp } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";

export default function SignUpPage() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();
	const { setMessage } = useMessage();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			validateSignUp(username, email, password);
		} catch (err: any) {
			setMessage({ text: err.message, type: "error" });
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
				router.push("/otp");
			} else {
				return setMessage({ text: data.message, type: "error" });
			}
		} catch (err) {
			return setMessage({ text: "Something went wrong.", type: "error" });
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
		</form>
	);
}
