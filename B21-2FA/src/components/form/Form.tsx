"use client";
import styles from "./Form.module.css";
import React from "react";

type Props = Readonly<
	React.PropsWithChildren<React.FormHTMLAttributes<HTMLFormElement>>
>;

export default function Form({ children, ...rest }: Props) {
	return (
		<form className={styles.form} {...rest}>
			{children}
		</form>
	);
}
