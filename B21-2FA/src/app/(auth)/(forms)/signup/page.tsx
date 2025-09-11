"use client";
import { useEffect, useState } from "react";
import { validateSignUp } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";
import Form from "@/components/form/Form";
import HiddenInput from "@/components/form/HiddenInput";
import { useResizeForm } from "../ResizeFormContext";

export default function SignUpPage() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState({ value: "", visible: false });
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

		try {
			const res = await fetch("/api/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, email, password }),
			});

			const data = await res.json();
			if (res.ok) {
				setOtp((otp) => ({ ...otp, visible: true }));
			} else {
				return setMessage({ text: data.message, type: "error" });
			}
		} catch (err) {
			return setMessage({ text: "Something went wrong.", type: "error" });
		}
	};

	const handleSignUp = async () => {
		if (!/^\d{6}$/.test(otp.value))
			return setMessage({ text: "Invalid OTP.", type: "error" });

		try {
			const res = await fetch(`/api/otp/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ otp: otp.value }),
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
		<Form onSubmit={handleSubmit} noValidate>
			<input
				type="text"
				placeholder="Enter Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				required
			/>

			<input
				type="email"
				placeholder="Enter Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
			/>

			<input
				type="password"
				placeholder="Enter Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>

			<HiddenInput
				field={otp}
				type="text"
				placeholder="Enter OTP"
				onChange={(e) => setOtp((otp) => ({ ...otp, value: e.target.value }))}
				required
			/>

			<button type="submit">{otp.visible ? "Sign Up" : "Send OTP"}</button>
		</Form>
	);
}
