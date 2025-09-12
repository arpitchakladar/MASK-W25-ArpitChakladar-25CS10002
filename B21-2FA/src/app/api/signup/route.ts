import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiResponse, withErrorHandler } from "@/lib/apiHandler";
import * as db from "@/lib/db";
import * as hashing from "@/lib/hashing";
import * as validation from "@/lib/form-validation";
import * as jwt from "@/lib/jwt";
import * as otp from "@/lib/otp";
import * as emailHandler from "@/lib/email";
import * as rateLimiter from "@/lib/rateLimiter";

type SignUpRequestBody = {
	username: string;
	email: string;
	password: string;
};

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { username, email, password } = (await req.json()) as SignUpRequestBody;
	const ip = rateLimiter.getClientIp(req);

	try {
		await rateLimiter.ipLimiter.consume(ip);
		await rateLimiter.userLimiter.consume(username);
		await rateLimiter.emailLimiter.consume(email);
	} catch {
		return apiResponse("Too many signup attempts. Try again later.", 429);
	}

	// User already exists
	if (
		(await db.getUserFromUsernameOrEmail(username)) ||
		(await db.getUserFromUsernameOrEmail(email))
	)
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
	await db.createUser({
		username,
		email,
		password: passwordHash + "$" + salt,
		validated: false,
		signupExpiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
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
	cookieStore.delete("rememberDevice");

	// Generate account validation OTP
	const currentOTP = await otp.generateOTP(preAuthToken, "signup");
	emailHandler.sendOtpEmail(email, currentOTP, "signup");

	return apiResponse("Sent an OTP to your email.", 201);
});
