"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";
import Form from "@/components/form/Form";
import authStyles from "../auth.module.css";

export default function RecoveryEmailPage() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState({ value: "", visible: false });
	const [password, setPassword] = useState({ value: "", visible: false });
	const router = useRouter();
	const { setMessage } = useMessage();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
	};

	return (
		<div className={authStyles.container}>
			<div className={authStyles.content}>
				<div className={authStyles.form}>
					<Form onSubmit={handleSubmit}>
						<input
							type="email"
							placeholder="Enter Email"
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
							{otp.visible ? "Set New Password" : "Send OTP"}
						</button>
					</Form>
				</div>
			</div>
		</div>
	);
}
