"use client";
import styles from "./HiddenInput.module.css";
import React from "react";

type HiddenField = {
	visible: boolean;
	value: string;
};

type Props = Readonly<
	{
		field: HiddenField;
	} & React.InputHTMLAttributes<HTMLInputElement>
>;

export default function HiddenInput({ field, ...rest }: Props) {
	return field.visible ? <input {...rest} value={field.value} /> : <></>;
}
