import * as db from "@/lib/db";

const generate6DigitNumber = () =>
	Math.floor(100000 + Math.random() * 900000).toString();

export async function generateOTP(preOTPToken: string): Promise<string> {
	const otp = generate6DigitNumber();
	db.createOTP(preOTPToken, Date.now() + 1000 * 60 * 10, otp);
	return otp;
}
