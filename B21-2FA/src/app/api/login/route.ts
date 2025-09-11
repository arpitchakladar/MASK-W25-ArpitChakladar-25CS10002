import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as hashing from "@/lib/hashing";
import * as jwt from "@/lib/jwt";
import * as otp from "@/lib/otp";
import { apiResponse, withErrorHandler } from "@/lib/apiHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { username, password } = await req.json();

	// Query database for users
	const user = await db.getUser(username);
	if (!user || !user.validated)
		return apiResponse("Your account was not found. Try creating one.", 404);

	// Validate password
	const [passwordHash, salt] = user.password.split("$");
	if (passwordHash !== hashing.getHash(password, salt))
		return apiResponse("Your password was incorrect.", 401);

	// Set pre-otp jwt cookie
	const cookieStore = await cookies();
	const preOTPToken = jwt.createJWT(username, await db.getPreOTPSecret());
	cookieStore.set("pre-otp", encodeURIComponent(preOTPToken), { path: "/" });

	// Generate otp
	const currentOTP = await otp.generateOTP(preOTPToken, "login");
	// TODO: Send email
	console.log(`The OTP is ${currentOTP}`);
	return apiResponse("Logged in successfully.");
});
