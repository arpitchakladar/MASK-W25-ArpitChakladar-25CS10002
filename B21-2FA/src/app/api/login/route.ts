import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiResponse, withErrorHandler } from "@/lib/apiHandler";
import * as db from "@/lib/db";
import * as hashing from "@/lib/hashing";
import * as jwt from "@/lib/jwt";
import * as otp from "@/lib/otp";
import * as emailHandler from "@/lib/email";
import * as rateLimiter from "@/lib/rateLimiter";

type LogInRequestBody = {
	username: string;
	password: string;
};

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { username, password } = (await req.json()) as LogInRequestBody;

	const ip = rateLimiter.getClientIp(req);

	try {
		await rateLimiter.ipLimiter.consume(ip);
		await rateLimiter.userLimiter.consume(username);
	} catch {
		return apiResponse("Too many login attempts. Try again later.", 429);
	}

	// Query database for users
	const user = await db.getUserFromUsernameOrEmail(username);
	if (!user || !user.validated)
		return apiResponse("Username or password was incorrect.", 401);

	// Validate password
	const [passwordHash, salt] = user.password.split("$");
	if (passwordHash !== hashing.getHash(password, salt))
		return apiResponse("Username or password was incorrect.", 401);

	// Set preAuthToken jwt cookie
	const cookieStore = await cookies();
	if (cookieStore.get("rememberDevice")) {
		try {
			jwt.validateJWT(
				decodeURIComponent(cookieStore.get("rememberDevice")?.value || ""),
				await db.getRememberDeviceSecret()
			);
			const authToken = jwt.createJWT(
				{ username },
				await db.getAuthTokenSecret()
			);
			cookieStore.set("authToken", encodeURIComponent(authToken), {
				path: "/",
			});
			return apiResponse("Logged in successfully.", 200, { skipOTP: true });
		} catch (err: any) {
			cookieStore.delete("rememberDevice");
		}
	}
	const preAuthToken = jwt.createJWT(
		{ username },
		await db.getPreAuthTokenSecret()
	);
	cookieStore.set("preAuthToken", encodeURIComponent(preAuthToken), {
		path: "/",
	});

	// Generate otp
	const currentOTP = await otp.generateOTP(preAuthToken, "login");
	emailHandler.sendOtpEmail(user.email, currentOTP, "login");
	return apiResponse("Sent an OTP to your email.", 200, { skipOTP: false });
});
