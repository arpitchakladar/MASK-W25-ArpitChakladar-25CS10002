"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";
import Form from "@/components/form/Form";
import authStyles from "../auth.module.css";
import { Esteban } from "next/font/google";

export default function RecoveryEmailPage() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState({ value: "", visible: false });
	const [password, setPassword] = useState({ value: "", visible: false });
	const router = useRouter();
	const { setMessage } = useMessage();

	const handleEcoveryEmailOtp = async () => {
		if (!email)
			return setMessage({
				text: "Please enter email.",
				type: "error",
			});

		try {
			const res = await fetch("/api/recovery-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const data = await res.json();
			if (res.ok) {
				setOtp((otp) => ({ ...otp, visible: true }));
			} else {
				return setMessage({
					text: data.message,
					type: "error",
				});
			}
		} catch (err) {
			return setMessage({
				text: "Something went wrong.",
				type: "error",
			});
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (otp.visible && password.visible) {
		} else if (otp.visible) {
		} else handleEcoveryEmailOtp();
	};

	return (
		<div className={authStyles.container}>
			<div className={authStyles.content}>
				<div className={authStyles.form}>
					<Form onSubmit={handleSubmit}>
						<h1>Recovery Email</h1>
						<input
							type="text"
							placeholder="Enter Username Or Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						{otp.visible && (
							<input
								value={otp.value}
								type="text"
								placeholder="Enter OTP"
								onChange={(e) =>
									setOtp((otp) => ({ ...otp, value: e.target.value }))
								}
								required
							/>
						)}
						{password.visible && (
							<input
								value={password.value}
								type="password"
								placeholder="Enter New Password"
								onChange={(e) =>
									setPassword((password) => ({
										...password,
										value: e.target.value,
									}))
								}
								required
							/>
						)}
						<button type="submit">
							{otp.visible ? "Validate" : "Send OTP"}
						</button>
					</Form>
				</div>
			</div>
		</div>
	);
}
