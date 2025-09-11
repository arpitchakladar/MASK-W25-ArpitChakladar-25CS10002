"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "../auth.module.css";
import { ResizeFormContext } from "../ResizeFormContext";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const contentRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState("auto");

	const resizeForm = () => {
		if (contentRef.current) {
			const newHeight = contentRef.current.scrollHeight + "px";
			setHeight(newHeight);
		}
	};

	useEffect(() => {
		resizeForm();
	}, [pathname, children]);

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.tab_bar}>
					<Link
						href="/login"
						className={`${styles.tab} ${
							pathname === "/login" ? styles.active_tab : ""
						}`}
					>
						Log In
					</Link>
					<Link
						href="/signup"
						className={`${styles.tab} ${
							pathname === "/signup" ? styles.active_tab : ""
						}`}
					>
						Sign Up
					</Link>
				</div>

				<div className={styles.form} style={{ height }}>
					<ResizeFormContext.Provider value={resizeForm}>
						<div ref={contentRef}>{children}</div>
					</ResizeFormContext.Provider>
				</div>
			</div>
		</div>
	);
}
