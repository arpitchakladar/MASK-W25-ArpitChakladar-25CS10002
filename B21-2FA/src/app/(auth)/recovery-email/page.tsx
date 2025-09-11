"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";
import Form from "@/components/form/Form";
import authStyles from "../auth.module.css";
import { validatePassword } from "@/lib/validation";

export default function RecoveryEmailPage() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState({ value: "", visible: false });
	const [password, setPassword] = useState({ value: "", visible: false });
	const router = useRouter();
	const { setMessage } = useMessage();

	const handleRecoveryEmailOtp = async () => {
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
				return setOtp((otp) => ({ ...otp, visible: true }));
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
	const handleRecoveryEmailOtpValidation = async () => {
		if (!otp.value || otp.value.length !== 6)
			return setMessage({
				text: "Please enter otp.",
				type: "error",
			});

		try {
			const res = await fetch("/api/recovery-email/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ otp: otp.value }),
			});

			const data = await res.json();
			if (res.ok) {
				setMessage({
					text: data.message,
					type: "success",
				});
				return setPassword((password) => ({ ...password, visible: true }));
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
	const handleResetPassword = async () => {
		try {
			validatePassword(password.value);
		} catch (err: any) {
			setMessage({ text: err.message, type: "error" });
			return;
		}

		try {
			const res = await fetch("/api/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password: password.value }),
			});

			const data = await res.json();
			if (res.ok) {
				setMessage({
					text: data.message,
					type: "success",
				});
				return router.push("/login");
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
		if (otp.visible && password.visible) handleResetPassword();
		else if (otp.visible) handleRecoveryEmailOtpValidation();
		else handleRecoveryEmailOtp();
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
							{password.visible
								? "Reset Password"
								: otp.visible
								? "Validate"
								: "Send OTP"}
						</button>
					</Form>
				</div>
			</div>
		</div>
	);
}
