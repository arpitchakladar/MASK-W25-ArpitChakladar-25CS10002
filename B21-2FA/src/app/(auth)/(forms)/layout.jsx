"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./auth.module.css";

export default function AuthLayout({ children }) {
	const pathname = usePathname();

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.tabs}>
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

				<div className={styles.form}>{children}</div>
			</div>
		</div>
	);
}
