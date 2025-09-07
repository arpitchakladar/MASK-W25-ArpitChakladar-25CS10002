"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./auth.module.css";

export default function AuthLayout({ children }) {
	const pathname = usePathname();
	const contentRef = useRef(null);
	const [height, setHeight] = useState("auto");

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
					<div ref={contentRef}>{children}</div>
				</div>
			</div>
		</div>
	);
}
