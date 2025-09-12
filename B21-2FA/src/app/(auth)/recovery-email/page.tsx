"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";
import Form from "@/components/form/Form";
import authStyles from "../auth.module.css";
import * as formValidation from "@/lib/form-validation";
import { apiRequest } from "@/lib/apiHandler";

// Helper to handle API requests
export default function RecoveryEmailPage() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState({ value: "", visible: false });
	const [password, setPassword] = useState({ value: "", visible: false });
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { setMessage } = useMessage();

	const handleRecoveryEmailOtp = useCallback(async () => {
		if (!email) {
			setMessage({ text: "Please enter email.", type: "error" });
			return;
		}
		setLoading(true);
		const { ok, data } = await apiRequest("/api/recovery-email", { email });
		setLoading(false);
		if (ok) {
			setMessage({ text: data.message, type: "success" });
			setOtp((otp) => ({ ...otp, visible: true }));
		} else {
			setMessage({ text: data.message, type: "error" });
		}
	}, [email, setMessage]);

	const handleRecoveryEmailOtpValidation = useCallback(async () => {
		if (!otp.value || otp.value.length !== 6) {
			setMessage({ text: "Please enter otp.", type: "error" });
			return;
		}
		setLoading(true);
		const { ok, data } = await apiRequest("/api/recovery-email/validate", {
			otp: otp.value,
		});
		setLoading(false);
		if (ok) {
			setMessage({ text: data.message, type: "success" });
			setPassword((password) => ({ ...password, visible: true }));
		} else {
			setMessage({ text: data.message, type: "error" });
		}
	}, [otp.value, setMessage]);

	const handleResetPassword = useCallback(async () => {
		try {
			formValidation.validatePassword(password.value);
		} catch (err: any) {
			setMessage({ text: err.message, type: "error" });
			return;
		}
		setLoading(true);
		const { ok, data } = await apiRequest("/api/reset-password", {
			password: password.value,
		});
		setLoading(false);
		if (ok) {
			setMessage({ text: data.message, type: "success" });
			router.push("/login");
		} else {
			setMessage({ text: data.message, type: "error" });
		}
	}, [password.value, setMessage, router]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (loading) return;
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
							disabled={otp.visible || password.visible || loading}
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
								disabled={password.visible || loading}
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
								disabled={loading}
								required
							/>
						)}
						<button type="submit" disabled={loading}>
							{loading
								? "Processing..."
								: password.visible
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
