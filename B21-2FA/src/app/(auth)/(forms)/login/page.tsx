"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";
import Form from "@/components/form/Form";
import { useResizeForm } from "../../ResizeFormContext";

export default function LogInPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
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

		try {
			const res = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();
			if (res.ok) {
				return setSecondFactor((secondFactor) => ({
					...secondFactor,
					visible: true,
				}));
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
		try {
			if (secondFactor.type === "otp") {
				if (!/^\d{6}$/.test(secondFactor.value))
					return setMessage({ text: "Invalid OTP.", type: "error" });

				const res = await fetch(`/api/otp/login`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ otp: secondFactor.value }),
				});

				const data = await res.json();
				if (res.ok) {
					setMessage({ text: data.message, type: "success" });
					return router.push("/");
				} else {
					return setMessage({ text: data.message, type: "error" });
				}
			} else {
				// Recovery code flow
				const res = await fetch(`/api/recovery-code`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ recoveryCode: secondFactor.value }),
				});

				const data = await res.json();
				if (res.ok) {
					setMessage({ text: data.message, type: "success" });
					return router.push("/");
				} else {
					return setMessage({ text: data.message, type: "error" });
				}
			}
		} catch {
			return setMessage({ text: "Something went wrong.", type: "error" });
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
				placeholder="Enter Username"
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

			{secondFactor.visible && (
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
				</>
			)}

			<button type="submit">
				{secondFactor.visible ? "Log In" : "Send OTP"}
			</button>
		</Form>
	);
}
