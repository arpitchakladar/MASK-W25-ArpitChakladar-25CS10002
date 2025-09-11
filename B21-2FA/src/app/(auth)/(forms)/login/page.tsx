"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";
import Form from "@/components/form/Form";
import { useResizeForm } from "../../ResizeFormContext";
import Link from "next/link";
import styles from "./login.module.css";
import { apiRequest } from "@/lib/apiHandler";

export default function LogInPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [rememberDevice, setRememberDevice] = useState(false);
	const [secondFactor, setSecondFactor] = useState<{
		type: "otp" | "recovery";
		value: string;
		visible: boolean;
	}>({ type: "otp", value: "", visible: false });
	const resizeForm = useResizeForm();
	const router = useRouter();
	const { setMessage } = useMessage();
	useEffect(() => {
		resizeForm();
	}, [secondFactor.visible]);

	const handleLoginSendOtp = async () => {
		if (!username || !password)
			return setMessage({
				text: "Please enter username and password.",
				type: "error",
			});

		const { ok, data } = await apiRequest("/api/login", { username, password });
		if (ok) {
			if (data.skipOTP) {
				setMessage({ text: data.message, type: "success" });
				return router.push("/");
			} else
				return setSecondFactor((secondFactor) => ({
					...secondFactor,
					visible: true,
				}));
		} else {
			setMessage({ text: data.message, type: "error" });
		}
	};

	const handleLogin = async () => {
		try {
			if (secondFactor.type === "otp") {
				if (!/^\d{6}$/.test(secondFactor.value))
					return setMessage({ text: "Invalid OTP.", type: "error" });

				const { ok, data } = await apiRequest("/api/otp/login", {
					otp: secondFactor.value,
					rememberDevice,
				});
				if (ok) {
					setMessage({ text: data.message, type: "success" });
					router.push("/");
				} else {
					setMessage({ text: data.message, type: "error" });
				}
			} else {
				const { ok, data } = await apiRequest("/api/recovery-code", {
					recoveryCode: secondFactor.value,
				});
				if (ok) {
					setMessage({ text: data.message, type: "success" });
					router.push("/");
				} else {
					setMessage({ text: data.message, type: "error" });
				}
			}
		} catch {
			setMessage({ text: "Something went wrong.", type: "error" });
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (secondFactor.visible) handleLogin();
		else handleLoginSendOtp();
	};

	return (
		<Form onSubmit={handleSubmit}>
			<input
				type="text"
				placeholder="Enter Username Or Email"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				disabled={secondFactor.visible}
				required
			/>

			<input
				type="password"
				placeholder="Enter Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				disabled={secondFactor.visible}
				required
			/>

			{secondFactor.visible ? (
				<>
					{secondFactor.type === "otp" ? (
						<input
							type="text"
							placeholder="Enter OTP"
							value={secondFactor.value}
							onChange={(e) =>
								setSecondFactor((prev) => ({ ...prev, value: e.target.value }))
							}
							required
						/>
					) : (
						<input
							type="text"
							placeholder="Enter Recovery Code"
							value={secondFactor.value}
							onChange={(e) =>
								setSecondFactor((prev) => ({ ...prev, value: e.target.value }))
							}
							required
						/>
					)}

					<button
						type="button"
						onClick={() =>
							setSecondFactor((prev) => ({
								...prev,
								type: prev.type === "otp" ? "recovery" : "otp",
								value: "",
							}))
						}
					>
						{secondFactor.type === "otp"
							? "Use recovery code instead"
							: "Use OTP instead"}
					</button>

					<label className="checkbox-label">
						<input
							type="checkbox"
							checked={rememberDevice}
							onChange={(e) => setRememberDevice(e.target.checked)}
						/>
						Remember this device for 30 days
					</label>
				</>
			) : (
				<div className={styles.forgotPassword}>
					<Link href="/recovery-email">Forgot password?</Link>
				</div>
			)}

			<button type="submit">
				{secondFactor.visible ? "Log In" : "Send OTP"}
			</button>
		</Form>
	);
}
