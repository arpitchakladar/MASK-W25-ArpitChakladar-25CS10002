"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "../auth.module.css";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const contentRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState("auto");
	const [message, setMessage] = useState(null);

	useEffect(() => {
		if (contentRef.current) {
			const newHeight = contentRef.current.scrollHeight + "px";
			setHeight(newHeight);
		}
	}, [pathname, children]);

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.tab_bar}>
					<Link
						href="/recovery/code"
						className={`${styles.tab} ${
							pathname === "/recovery/code" ? styles.active_tab : ""
						}`}
					>
						Recovery Codes
					</Link>
					<Link
						href="/recovery/email"
						className={`${styles.tab} ${
							pathname === "/recovery/email" ? styles.active_tab : ""
						}`}
					>
						Email
					</Link>
				</div>

				<div className={styles.form} style={{ height }}>
					<div ref={contentRef}>{children}</div>
				</div>
			</div>
		</div>
	);
}
