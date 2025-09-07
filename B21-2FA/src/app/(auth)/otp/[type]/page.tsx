"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "../../auth.module.css";
import { useMessage } from "@/app/MessageContext";

export default function OTPPage() {
	const [otp, setOtp] = useState("");
	const router = useRouter();
	const { setMessage } = useMessage();

	// Get the type parameter from the path
	const params = useParams();
	const type = (params?.type || "login").toString(); // default to login

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!/^\d{6}$/.test(otp))
			return setMessage({ text: "Invalid OTP.", type: "error" });

		if (type === "signup" || type === "login") {
			try {
				const res = await fetch(`/api/${type}/otp`, {
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
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.form}>
					<form className={styles.content} onSubmit={handleSubmit}>
						<h1>{type.toUpperCase().replaceAll("_", " ")}</h1>
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
			</div>
		</div>
	);
}
