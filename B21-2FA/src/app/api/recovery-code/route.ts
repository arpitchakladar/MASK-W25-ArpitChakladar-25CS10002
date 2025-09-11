import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as jwt from "@/lib/jwt";
import { withErrorHandler, apiResponse } from "@/lib/apiHandler";
import { getHash } from "@/lib/hashing";
import { getClientIp, ipLimiter, emailLimiter } from "@/lib/rateLimiter";

type RecoveryCodeRequestBody = {
	recoveryCode: string;
};

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { recoveryCode } = (await req.json()) as RecoveryCodeRequestBody;

	const ip = getClientIp(req);

	try {
		await ipLimiter.consume(ip);
	} catch {
		return apiResponse(
			"Too many account recovery attempts. Try again later.",
			429
		);
	}

	const cookieStore = await cookies();
	const preAuthToken = decodeURIComponent(
		cookieStore.get("preAuthToken")?.value || ""
	);

	try {
		jwt.validateJWT(preAuthToken, await db.getPreAuthTokenSecret());
	} catch (err: any) {
		cookieStore.delete("preAuthToken");
		return apiResponse("Invalid pre otp token.", 401);
	}

	const username = JSON.parse(atob(preAuthToken.split("$")[0])).username;
	const user = await db.getUser(username);

	if (!user) throw Error("Using recovery code for a user that doesn't exist.");

	// Query db for recovery token and compare with user input
	const recoveryCodeHashed = getHash(recoveryCode, user.recoveryCodes.salt);
	let match = false;
	for (const code of user.recoveryCodes.codes) {
		if (recoveryCodeHashed === code) {
			match = true;
			await db.updateUser(username, {
				recoveryCodes: {
					salt: user.recoveryCodes.salt,
					codes: user.recoveryCodes.codes.filter((ccode) => ccode !== code),
				},
			});
		}
	}
	if (!match) return apiResponse("Invalid recovery token.", 401);

	cookieStore.delete("preAuthToken");
	db.deleteOTPByType("login", preAuthToken);

	const authToken = jwt.createJWT({ username }, await db.getAuthTokenSecret());
	cookieStore.set("authToken", encodeURIComponent(authToken), { path: "/" });
	return apiResponse("Logged in successfully.");
});
