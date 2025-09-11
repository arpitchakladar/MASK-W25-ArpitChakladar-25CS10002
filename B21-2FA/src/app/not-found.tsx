import styles from "./not-found.module.css";

export default function NotFound() {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>404</h1>
			<p className={styles.message}>
				Sorry, the page you are looking for could not be found.
			</p>
			<a href="/" className={styles.button}>
				Go Home
			</a>
		</div>
	);
}
