"use client";

import { useState } from "react";
import styles from "./login.module.css";
import formStyles from "@/styles/form.module.css";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");

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
			} else {
				setMessage(`❌ ${data.message}`);
			}
		} catch (err) {
			setMessage("⚠️ Something went wrong");
		}
	};

	return (
		<div className={styles.login}>
			<form
				onSubmit={handleSubmit}
				className={`${styles.login_form} ${formStyles.form}`}
			>
				<h1 className={formStyles.form_heading}>Log In</h1>

				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
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
					Log In
				</button>

				{message && <p className="">{message}</p>}
			</form>
		</div>
	);
}
