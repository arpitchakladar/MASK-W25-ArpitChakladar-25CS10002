import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as jwt from "@/lib/jwt";
import * as otp from "@/lib/otp";
import { apiResponse, withErrorHandler } from "@/lib/apiHandler";
import { sendOtpEmail } from "@/lib/email";
import { getClientIp, ipLimiter, emailLimiter } from "@/lib/rateLimiter";

type RecoveryEmailRequestBody = {
	email: string;
};

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { email } = (await req.json()) as RecoveryEmailRequestBody;

	const ip = getClientIp(req);

	try {
		await ipLimiter.consume(ip);
		await emailLimiter.consume(email);
	} catch {
		return apiResponse(
			"Too many account recovery attempts. Try again later.",
			429
		);
	}

	// Query database for users
	const user = await db.getUserFromUsernameOrEmail(email);
	if (!user || !user.validated)
		return apiResponse("Sent an OTP to your email.");

	// Set recoveryEmailToken jwt cookie
	const cookieStore = await cookies();
	const recoveryEmailToken = jwt.createJWT(
		{ username: user.username },
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
	sendOtpEmail(user.email, currentOTP, "reset password");
	return apiResponse("Sent an OTP to your email.");
});
