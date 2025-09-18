import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { withErrorHandler, apiResponse } from "@/lib/apiHandler";
import * as db from "@/lib/db";
import * as jwt from "@/lib/jwt";
import * as hashing from "@/lib/hashing";
import * as rateLimiter from "@/lib/rateLimiter";
import * as recoveryCodes from "@/lib/recoveryCodes";

type OtpLogInSignUpRequestBody = {
	otp: string;
	rememberDevice: boolean;
};

export const POST = withErrorHandler(
	async (req: NextRequest, context: { params: Promise<{ type: string }> }) => {
		const params = await context.params;
		if (params.type !== "login" && params.type !== "signup")
			return apiResponse("Page not found.", 404);

		const ip = rateLimiter.getClientIp(req);

		try {
			await rateLimiter.ipLimiter.consume(ip);
		} catch {
			return apiResponse(
				"Too many account recovery attempts. Try again later.",
				429
			);
		}
		const { otp: reqOTP, rememberDevice } =
			(await req.json()) as OtpLogInSignUpRequestBody;

		// Read preAuthToken cookie
		const cookieStore = await cookies();
		const preAuthToken = decodeURIComponent(
			cookieStore.get("preAuthToken")?.value || ""
		);

		// Validate preAuthToken jwt
		try {
			jwt.validateJWT(preAuthToken, await db.getPreAuthTokenSecret());
		} catch (err: any) {
			cookieStore.delete("preAuthToken");
			return apiResponse("Invalid pre otp token.", 401);
		}

		// Query db for otp and compare with user input
		const otpEntry = await db.getOTP({
			type: params.type,
			token: preAuthToken,
		});
		if (
			!otpEntry ||
			otpEntry.otp !== reqOTP ||
			otpEntry.expiration.getTime() < Date.now()
		)
			return apiResponse("Invalid OTP.", 401);

		// Delete preAuthToken
		cookieStore.delete("preAuthToken");
		db.deleteOTP({ type: params.type, token: preAuthToken });

		const data: { recoveryCodes?: string[] } = {};

		const username = JSON.parse(atob(preAuthToken.split("$")[0]))
			.username as string;
		if (params.type === "signup") {
			const user = await db.getUserFromUsernameOrEmail(username);
			if (!user) throw Error("Unauthenticated.");
			const userRecoveryCodes = recoveryCodes.generateRecoveryCodes();
			data.recoveryCodes = userRecoveryCodes;
			const salt = hashing.generateSalt();
			await db.updateUser(
				{ username },
				{
					validated: true,
					recoveryCodes: {
						salt: salt,
						codes: userRecoveryCodes.map((code) => hashing.getHash(code, salt)),
					},
				}
			);
		}
		// Create authToken token
		const authToken = jwt.createJWT(
			{ username },
			await db.getAuthTokenSecret()
		);
		cookieStore.set("authToken", encodeURIComponent(authToken), { path: "/" });
		if (rememberDevice) {
			const rememberDeviceToken = jwt.createJWT(
				{ username },
				await db.getRememberDeviceSecret()
			);
			cookieStore.set(
				"rememberDevice",
				encodeURIComponent(rememberDeviceToken),
				{
					path: "/",
				}
			);
		}
		return apiResponse("Logged in successfully.", 200, data);
	}
);
