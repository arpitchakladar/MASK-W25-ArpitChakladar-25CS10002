import nodemailer from "nodemailer";

export async function sendOtpEmail(
	to: string,
	otp: string,
	type: "login" | "signup" | "reset password"
) {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.GMAIL_USER,
			pass: process.env.GMAIL_PASS,
		},
	});

	await transporter.sendMail({
		from: `"B21-2FA" <B21-F2A@kgpmask.club>`,
		to,
		subject: "OTP",
		text: `Your ${type} OTP is ${otp}`,
	});
}
