"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";

export default function RecoveryEmailPage() {
	const [step, setStep] = useState<"email" | "otp" | "password">("email");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");

	const router = useRouter();
	const { setMessage } = useMessage();

	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const res = await fetch("/api/recovery/email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const data = await res.json();
			if (res.ok) {
				setMessage({ text: data.message, type: "success" });
				setStep("otp"); // move to OTP step
			} else {
				setMessage({ text: data.message, type: "error" });
			}
		} catch {
			setMessage({ text: "Something went wrong.", type: "error" });
		}
	};

	const handleOtpSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const res = await fetch("/api/otp/recovery", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, otp }),
			});

			const data = await res.json();
			if (res.ok) {
				setMessage({ text: data.message, type: "success" });
				setStep("password"); // move to password step
			} else {
				setMessage({ text: data.message, type: "error" });
			}
		} catch {
			setMessage({ text: "Something went wrong.", type: "error" });
		}
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const res = await fetch("/api/recovery/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, otp, password }),
			});

			const data = await res.json();
			if (res.ok) {
				setMessage({ text: data.message, type: "success" });
				router.push("/login");
			} else {
				setMessage({ text: data.message, type: "error" });
			}
		} catch {
			setMessage({ text: "Something went wrong.", type: "error" });
		}
	};

	return (
		<div>
			{step === "email" && (
				<form onSubmit={handleEmailSubmit} noValidate>
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<button type="submit">Send OTP</button>
				</form>
			)}

			{step === "otp" && (
				<form onSubmit={handleOtpSubmit} noValidate>
					<input
						type="text"
						placeholder="Enter OTP"
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
						required
					/>
					<button type="submit">Verify OTP</button>
				</form>
			)}

			{step === "password" && (
				<form onSubmit={handlePasswordSubmit} noValidate>
					<input
						type="password"
						placeholder="New Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					<button type="submit">Reset Password</button>
				</form>
			)}
		</div>
	);
}
