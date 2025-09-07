import * as db from "@/lib/db";

function generate6DigitNumber() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function generateOTP(preOTPToken: string, type: db.OTPType) {
	const otp = generate6DigitNumber();

	await db.createOTPByType(type, {
		preOTPToken,
		expiration: Date.now() + 1000 * 60 * 10, // 10 minutes
		otp,
	});

	return otp;
}
