import styles from "./page.module.css";
import * as jwt from "@/lib/jwt";
import * as db from "@/lib/db";
import LogoutButton from "./LogoutButton"; // client component

export default async function Home() {
	// Server-side auth check
	const cookieStore = await import("next/headers").then((m) => m.cookies());
	const token = decodeURIComponent(cookieStore.get("jwt")?.value || "");
	let username: string | null = null;

	if (token) {
		try {
			jwt.validateJWT(token, await db.getSecret());
			username = JSON.parse(atob(token.split("$")[0])).username;
		} catch (err) {
			username = null;
		}
	}

	return (
		<div className={styles.page}>
			{!username ? (
				<>
					<img
						src="https://nrecclessmith.com/wp-content/uploads/2020/03/cry-funny-rain-yui-favim.com-235795.gif?w=584"
						alt=""
						className={styles.background}
					/>
					<div className={styles.card}>
						<h1>Welcome!</h1>
						<p>You have not yet logged in.</p>
						<a href="/login">Log In</a>
					</div>
				</>
			) : (
				<>
					<img
						src="https://i.pinimg.com/originals/37/d7/29/37d729ae35622b8fc8de12835a502dec.gif"
						alt=""
						className={styles.background}
					/>
					<div className={styles.card}>
						<h1>Welcome Back, {username}!</h1>
						<p>You are logged in.</p>
						<LogoutButton />
					</div>
				</>
			)}
		</div>
	);
}
