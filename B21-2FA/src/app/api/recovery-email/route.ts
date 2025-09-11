import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as jwt from "@/lib/jwt";
import * as otp from "@/lib/otp";
import { apiResponse, withErrorHandler } from "@/lib/apiHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { email } = await req.json();

	// Query database for users
	const user = await db.getUser(email);
	if (!user || !user.validated)
		return apiResponse("Sent an OTP to your email.");

	// Set recoveryEmailToken jwt cookie
	const cookieStore = await cookies();
	const recoveryEmailToken = jwt.createJWT(
		user.username,
		await db.getRecoveryEmailTokenSecret()
	);
	cookieStore.set(
		"recoveryEmailToken",
		encodeURIComponent(recoveryEmailToken),
		{ path: "/" }
	);

	// Generate otp
	const currentOTP = await otp.generateOTP(
		recoveryEmailToken,
		"recoveryEmailToken"
	);
	// TODO: Send email
	console.log(`The OTP is ${currentOTP} for email ${user.email}`);
	return apiResponse("Sent an OTP to your email.");
});
