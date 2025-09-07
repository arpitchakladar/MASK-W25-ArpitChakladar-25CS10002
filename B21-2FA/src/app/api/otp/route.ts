import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as jwt from "@/lib/jwt";
import { withErrorHandler, apiResponse } from "@/lib/apiHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { otp: reqOTP } = await req.json();

	// Read pre-otp cookie
	const cookieStore = await cookies();
	const preOTPToken = decodeURIComponent(
		cookieStore.get("pre-otp")?.value || ""
	);

	// Validate pre-otp jwt
	try {
		jwt.validateJWT(preOTPToken, await db.getPreOTPSecret());
	} catch (err: any) {
		cookieStore.delete("pre-otp");
		return apiResponse("Invalid pre otp token.", 401);
	}

	// Query db for otp and compare with user input
	const otpEntry = await db.getOTP(preOTPToken);
	if (!otpEntry || otpEntry.otp !== reqOTP)
		return apiResponse("Invalid OTP.", 401);
	if (otpEntry.expiration < Date.now()) {
		cookieStore.delete("pre-otp");
		return apiResponse("OTP timeout.", 401);
	}

	// Delete pre-otp
	cookieStore.delete("pre-otp");
	db.deleteOTP(preOTPToken);

	const username = JSON.parse(atob(preOTPToken.split("$")[0])).username;
	// Validate user account if invalidated
	if (otpEntry.validation) db.updateUser(username, { validated: true });
	// Create jwt token
	const jwtToken = jwt.createJWT(username, await db.getSecret());
	cookieStore.set("jwt", encodeURIComponent(jwtToken), { path: "/" });
	return apiResponse("Logged in successfully.");
});
