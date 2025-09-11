"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMessage } from "@/app/MessageContext";
import Form from "@/components/form/Form";

export default function RecoveryCodePage() {
	const [username, setUsername] = useState("");
	const [recoveryCode, setRecoveryCode] = useState("");
	const router = useRouter();
	const { setMessage } = useMessage();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
	};

	return (
		<Form onSubmit={handleSubmit}>
			<input
				type="text"
				placeholder="Enter Username"
				value={recoveryCode}
				onChange={(e) => setUsername(e.target.value)}
				required
			/>
			<input
				type="text"
				placeholder="Enter Recovery Code"
				value={recoveryCode}
				onChange={(e) => setRecoveryCode(e.target.value)}
				required
			/>
			<button type="submit">Use Recovery Code</button>
		</Form>
	);
}
