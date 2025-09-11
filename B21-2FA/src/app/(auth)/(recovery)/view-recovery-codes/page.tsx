"use client";
import React from "react";
import authStyles from "../../auth.module.css";
import styles from "./view-recovery-codes.module.css";
import Link from "next/link";

export default function ViewRecoveryCodesPage() {
	return (
		<div className={authStyles.container}>
			<div className={authStyles.content}>
				<div className={`${authStyles.form} ${styles.container}`}>
					<h1 className={styles.heading}>Recovery Codes</h1>
					<div className={styles.codes}>
						<p>6H9X-2K7M</p>
						<p>RV4T-QN2Y</p>
						<p>A8PZ-7H5C</p>
						<p>MK3N-9D2X</p>
						<p>YF6J-4T8W</p>
						<p>Q7DZ-1M5R</p>
						<p>H2XK-9L8V</p>
						<p>W3TP-7N6Q</p>
						<p>B9YC-2F4M</p>
						<p>ZT5H-8K1R</p>
					</div>
					<Link className={styles.homeButton} href="/">
						Home
					</Link>
				</div>
			</div>
		</div>
	);
}
