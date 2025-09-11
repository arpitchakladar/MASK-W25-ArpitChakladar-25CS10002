"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";
import Form from "@/components/form/Form";
import HiddenInput from "@/components/form/HiddenInput";
import { useResizeForm } from "../ResizeFormContext";

export default function LogInPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState({ value: "", visible: false });
	const resizeForm = useResizeForm();
	const router = useRouter();
	const { setMessage } = useMessage();
	useEffect(() => {
		resizeForm();
	}, [otp.visible]);

	const handleLoginSendOtp = async () => {
		if (!username || !password)
			return setMessage({
				text: "Please enter username and password.",
				type: "error",
			});

		try {
			const res = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
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

	const handleLogin = async () => {
		if (!/^\d{6}$/.test(otp.value))
			return setMessage({ text: "Invalid OTP.", type: "error" });

		try {
			const res = await fetch(`/api/otp/login`, {
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (otp.visible) handleLogin();
		else handleLoginSendOtp();
	};

	return (
		<Form onSubmit={handleSubmit}>
			<input
				type="text"
				placeholder="Enter Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
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

			<button type="submit">{otp.visible ? "Log In" : "Send OTP"}</button>
		</Form>
	);
}
