import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as hashing from "@/lib/hashing";
import * as validation from "@/lib/validation";
import * as jwt from "@/lib/jwt";
import * as otp from "@/lib/otp";
import { apiResponse, withErrorHandler } from "@/lib/apiHandler";
import { generateRecoveryCodes } from "@/lib/recoveryCodes";
import { sendOtpEmail } from "@/lib/email";

type SignUpRequestBody = {
	username: string;
	email: string;
	password: string;
};

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { username, email, password } = (await req.json()) as SignUpRequestBody;

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
	const recoveryCodes = generateRecoveryCodes();
	// TODO: User creation should be done after otp validation
	db.createUser({
		username,
		email,
		password: passwordHash + "$" + salt,
		validated: false,
		// Here recovery codes are stored in plain text, until account is verified
		recoveryCodes: {
			codes: recoveryCodes,
			salt: "",
		},
	});

	// Issue pre-OTP token
	const cookieStore = await cookies();
	const preAuthToken = jwt.createJWT(
		{ username },
		await db.getPreAuthTokenSecret()
	);
	cookieStore.set("preAuthToken", encodeURIComponent(preAuthToken), {
		path: "/",
	});

	// Generate account validation OTP
	const currentOTP = await otp.generateOTP(preAuthToken, "signup");
	sendOtpEmail(email, currentOTP, "login");

	return apiResponse("Signed up successfully.", 201);
});
