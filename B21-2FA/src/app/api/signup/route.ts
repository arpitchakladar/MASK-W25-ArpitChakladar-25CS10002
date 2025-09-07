import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as hashing from "@/lib/hashing";
import * as validation from "@/lib/validation";
import * as jwt from "@/lib/jwt";
import * as otp from "@/lib/otp";
import { apiResponse, withErrorHandler } from "@/lib/apiHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
	try {
		const { username, email, password } = await req.json();

		// User already exists
		if ((await db.getUser(username)) || (await db.getUser(email)))
			return apiResponse("Username or email already exists.", 401);

		// Validation
		try {
			validation.validateSignUp(username, email, password);
		} catch (err: any) {
			return apiResponse(err.message, 401);
		}

		// Create user
		const salt = hashing.generateSalt();
		const passwordHash = hashing.getHash(password, salt);
		db.createUser({
			username,
			email,
			password: passwordHash + "$" + salt,
			validated: false,
		});

		// Issue pre-OTP token
		const cookieStore = await cookies();
		const preOTPToken = jwt.createJWT(username, await db.getPreOTPSecret());
		cookieStore.set("pre-otp", encodeURIComponent(preOTPToken), { path: "/" });

		// Generate account validation OTP
		const currentOTP = await otp.generateOTP(preOTPToken, true);
		// TODO: Send email
		console.log(`The OTP is ${currentOTP}`);

		return apiResponse("Signed up successfully.", 201);
	} catch (err: any) {
		console.error(err);
		return apiResponse(err.message || "Something went wrong", 500);
	}
});
