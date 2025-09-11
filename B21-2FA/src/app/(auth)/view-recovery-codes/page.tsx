"use client";
import React, { useEffect, useState } from "react";
import authStyles from "../auth.module.css";
import styles from "./view-recovery-codes.module.css";
import Link from "next/link";

export default function ViewRecoveryCodesPage() {
	const [codes, setCodes] = useState<string[]>([]);

	useEffect(() => {
		const stored = sessionStorage.getItem("recoveryCodes");
		if (stored) {
			setCodes(JSON.parse(stored));
		}
	}, []);

	return (
		<div className={authStyles.container}>
			<div className={authStyles.content}>
				<div className={`${authStyles.form} ${styles.container}`}>
					<h1 className={styles.heading}>Recovery Codes</h1>
					{codes.length > 0 ? (
						<div className={styles.codes}>
							{codes.map((code, i) => (
								<p key={i}>{code}</p>
							))}
						</div>
					) : (
						<div className={styles.noCodes}>No recovery codes available.</div>
					)}
					<Link className={styles.homeButton} href="/">
						Home
					</Link>
				</div>
			</div>
		</div>
	);
}
