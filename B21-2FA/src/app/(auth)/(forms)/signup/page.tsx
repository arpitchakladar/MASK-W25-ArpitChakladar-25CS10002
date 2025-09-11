"use client";
import { useEffect, useState } from "react";
import { validateSignUp } from "@/lib/form-validation";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";
import Form from "@/components/form/Form";
import { useResizeForm } from "../../ResizeFormContext";
import { apiRequest } from "@/lib/apiHandler";

export default function SignUpPage() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState({ value: "", visible: false });
	const [rememberDevice, setRememberDevice] = useState(false);
	const resizeForm = useResizeForm();
	const router = useRouter();
	const { setMessage } = useMessage();

	useEffect(() => {
		resizeForm();
	}, [otp.visible]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (otp.visible) handleSignUp();
		else handleSignUpSendOtp();
	};

	const handleSignUpSendOtp = async () => {
		try {
			validateSignUp(username, email, password);
		} catch (err: any) {
			setMessage({ text: err.message, type: "error" });
			return;
		}

		const { ok, data } = await apiRequest("/api/signup", {
			username,
			email,
			password,
		});
		if (ok) {
			setOtp((otp) => ({ ...otp, visible: true }));
		} else {
			setMessage({ text: data.message, type: "error" });
		}
	};

	const handleSignUp = async () => {
		if (!/^\d{6}$/.test(otp.value))
			return setMessage({ text: "Invalid OTP.", type: "error" });

		const { ok, data } = await apiRequest("/api/otp/signup", {
			otp: otp.value,
			rememberDevice, // ✅ send along with OTP
		});
		if (ok) {
			setMessage({ text: data.message, type: "success" });
			sessionStorage.setItem(
				"recoveryCodes",
				JSON.stringify(data.recoveryCodes)
			);
			router.push("/view-recovery-codes");
		} else {
			setMessage({ text: data.message, type: "error" });
		}
	};

	return (
		<Form onSubmit={handleSubmit} noValidate>
			<input
				type="text"
				placeholder="Enter Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				disabled={otp.visible}
				required
			/>

			<input
				type="email"
				placeholder="Enter Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				disabled={otp.visible}
				required
			/>

			<input
				type="password"
				placeholder="Enter Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				disabled={otp.visible}
				required
			/>

			{otp.visible && (
				<>
					<input
						value={otp.value}
						type="text"
						placeholder="Enter OTP"
						onChange={(e) =>
							setOtp((otp) => ({ ...otp, value: e.target.value }))
						}
						required
					/>

					<label className="checkbox-label">
						<input
							type="checkbox"
							checked={rememberDevice}
							onChange={(e) => setRememberDevice(e.target.checked)}
						/>
						Remember this device for 30 days
					</label>
				</>
			)}

			<button type="submit">{otp.visible ? "Sign Up" : "Send OTP"}</button>
		</Form>
	);
}
