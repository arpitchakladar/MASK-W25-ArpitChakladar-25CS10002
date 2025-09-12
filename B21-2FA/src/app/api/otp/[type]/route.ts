import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as jwt from "@/lib/jwt";
import { withErrorHandler, apiResponse } from "@/lib/apiHandler";
import { generateSalt, getHash } from "@/lib/hashing";
import { getClientIp, ipLimiter } from "@/lib/rateLimiter";

export const POST = withErrorHandler(
	async (req: NextRequest, context: { params: Promise<{ type: string }> }) => {
		const params = await context.params;
		if (params.type !== "login" && params.type !== "signup")
			return apiResponse("Page not found.", 404);

		const ip = getClientIp(req);

		try {
			await ipLimiter.consume(ip);
		} catch {
			return apiResponse(
				"Too many account recovery attempts. Try again later.",
				429
			);
		}
		const { otp: reqOTP, rememberDevice } = await req.json();

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
			otpEntry.expiration < Date.now()
		)
			return apiResponse("Invalid OTP.", 401);

		// Delete preAuthToken
		cookieStore.delete("preAuthToken");
		db.deleteOTP({ type: params.type, token: preAuthToken });

		const data: { recoveryCodes?: string[] } = {};

		const username = JSON.parse(atob(preAuthToken.split("$")[0]))
			.username as string;
		if (params.type === "signup") {
			const user = await db.getUser(username);
			if (!user) throw Error("Unauthenticated.");
			data.recoveryCodes = user.recoveryCodes.codes;
			const salt = generateSalt();
			await db.updateUser(username, {
				validated: true,
				recoveryCodes: {
					salt: salt,
					codes: user.recoveryCodes.codes.map((code) => getHash(code, salt)),
				},
			});
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
