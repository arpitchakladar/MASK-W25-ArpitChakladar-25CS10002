"use client";

import { useState } from "react";
import styles from "./signup.module.css";
import formStyles from "@/styles/form.module.css";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const res = await fetch("/api/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, email, password }),
			});

			const data = await res.json();
			if (res.ok) {
				setMessage(`✅ ${data.message}`);
			} else {
				setMessage(`❌ ${data.message}`);
			}
		} catch (err) {
			setMessage("⚠️ Something went wrong");
		}
	};

	return (
		<div className={styles.signup}>
			<form
				onSubmit={handleSubmit}
				className={`${styles.signup_form} ${formStyles.form}`}
			>
				<h1 className={formStyles.form_heading}>Sign Up</h1>

				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className={formStyles.form_input}
					required
				/>

				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className={formStyles.form_input}
					required
				/>

				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className={formStyles.form_input}
					required
				/>

				<button type="submit" className={formStyles.form_button}>
					Sign Up
				</button>

				{message && <p className="">{message}</p>}
			</form>
		</div>
	);
}
