"use client";
import { useState, useEffect } from "react";
import styles from "./FloatingMessage.module.css";

type Props = {
	message: string;
	type?: "error" | "success" | "info";
	onClose?: () => void;
};

export default function FloatingMessage({
	message,
	type = "error",
	onClose,
}: Props) {
	const [visible, setVisible] = useState(true);

	const handleClose = () => {
		setVisible(false);
		if (onClose) onClose();
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			handleClose();
		}, 4000);

		return () => clearTimeout(timer);
	}, []);

	if (!visible) return null;

	return (
		<div className={`${styles.message} ${styles[type]}`}>
			<span>{message}</span>
			<button className={styles.close} onClick={handleClose}>
				&times;
			</button>
		</div>
	);
}
