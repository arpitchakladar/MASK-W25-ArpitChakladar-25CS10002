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
			const res = await fetch("/api/recovery/email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const data = await res.json();
			if (res.ok) {
				router.push("/otp/email_recovery");
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
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
			/>

			<button type="submit">Send OTP</button>
		</form>
	);
}
