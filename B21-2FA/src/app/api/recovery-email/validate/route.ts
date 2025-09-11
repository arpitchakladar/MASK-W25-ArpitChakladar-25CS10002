import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as jwt from "@/lib/jwt";
import { withErrorHandler, apiResponse } from "@/lib/apiHandler";

type RecoveryEmailValidateRequestBody = {
	otp: string;
};

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { otp: reqOTP } =
		(await req.json()) as RecoveryEmailValidateRequestBody;

	// Read recoveryEmailToken cookie
	const cookieStore = await cookies();
	const recoveryEmailToken = decodeURIComponent(
		cookieStore.get("recoveryEmailToken")?.value || ""
	);

	// Validate recoveryEmailToken jwt
	try {
		jwt.validateJWT(recoveryEmailToken, await db.getRecoveryEmailTokenSecret());
	} catch (err: any) {
		cookieStore.delete("recoveryEmailToken");
		return apiResponse("Invalid pre otp token.", 401);
	}

	// Query db for otp and compare with user input
	const otpEntry = await db.getOTPByType(
		"recoveryEmailToken",
		recoveryEmailToken
	);
	if (!otpEntry || otpEntry.otp !== reqOTP)
		return apiResponse("Invalid OTP.", 401);
	if (otpEntry.expiration < Date.now()) {
		cookieStore.delete("recoveryEmailToken");
		return apiResponse("OTP timeout.", 401);
	}

	// Delete recoveryEmailToken
	cookieStore.delete("recoveryEmailToken");
	db.deleteOTPByType("recoveryEmailToken", recoveryEmailToken);

	const username = JSON.parse(atob(recoveryEmailToken.split("$")[0]))
		.username as string;
	const resetPasswordToken = jwt.createJWT(
		{ username },
		await db.getResetPasswordSecret()
	);
	cookieStore.set(
		"resetPasswordToken",
		encodeURIComponent(resetPasswordToken),
		{ path: "/" }
	);
	return apiResponse("OTP validated successfully.");
});
