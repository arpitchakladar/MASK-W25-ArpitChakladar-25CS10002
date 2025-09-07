"use client";
import { useState } from "react";
import styles from "./otp.module.css";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";

export default function OTPPage() {
	const [otp, setOtp] = useState("");
	const router = useRouter();
	const { setMessage } = useMessage();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!/^\d{6}$/.test(otp))
			return setMessage({ text: "Invalid OTP.", type: "error" });

		try {
			const res = await fetch("/api/otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ otp }),
			});

			const data = await res.json();
			if (res.ok) {
				setMessage({ text: data.message, type: "success" });
				return router.push("/");
			} else {
				return setMessage({ text: data.message, type: "error" });
			}
		} catch (err) {
			return setMessage({ text: "Something went wrong.", type: "error" });
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
			</form>
		</div>
	);
}
