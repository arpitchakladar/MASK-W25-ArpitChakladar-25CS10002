"use client";
import { useState } from "react";
import styles from "./otp.module.css";
import { useRouter } from "next/navigation";

export default function AuthLayout() {
	const [otp, setOtp] = useState("");
	const [message, setMessage] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!/^\d{6}$/.test(otp)) {
			setMessage("Invalid OTP.");
			return;
		}

		try {
			const res = await fetch("/api/otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ otp }),
			});

			const data = await res.json();
			if (res.ok) {
				setMessage(`✅ ${data.message}`);
				router.push("/");
			} else {
				setMessage(`❌ ${data.message}`);
			}
		} catch (err) {
			setMessage("⚠️ Something went wrong");
		}
	};

	return (
		<div className={styles.container}>
			<form className={styles.content} onSubmit={handleSubmit}>
				<h1>Enter OTP</h1>
				<input
					placeholder="OTP"
					type="text"
					value={otp}
					inputMode="numeric"
					pattern="[0-9]*"
					onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
				/>
				<button type="submit">Submit</button>
				{message && <p>{message}</p>}
			</form>
		</div>
	);
}
