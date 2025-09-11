"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import FloatingMessage from "./FloatingMessage";

type Message = {
	text: string;
	type: "error" | "success" | "info";
};

type MessageContextType = {
	setMessage: (msg: Message) => void;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
	const context = useContext(MessageContext);
	if (!context)
		throw new Error("useMessage must be used inside MessageProvider");
	return context;
};

export default function MessageProvider({ children }: { children: ReactNode }) {
	const [message, setMessage] = useState<Message | null>(null);

	return (
		<MessageContext.Provider value={{ setMessage }}>
			{children}
			{message && (
				<FloatingMessage
					message={message.text}
					type={message.type}
					onClose={() => setMessage(null)}
				/>
			)}
		</MessageContext.Provider>
	);
}
