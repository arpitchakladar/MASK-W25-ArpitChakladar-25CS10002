import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as jwt from "@/lib/jwt";
import { withErrorHandler, apiResponse } from "@/lib/apiHandler";
import { getHash } from "@/lib/hashing";

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { recoveryCode } = await req.json();

	const cookieStore = await cookies();
	const preOTPToken = decodeURIComponent(
		cookieStore.get("pre-otp")?.value || ""
	);

	try {
		jwt.validateJWT(preOTPToken, await db.getPreOTPSecret());
	} catch (err: any) {
		cookieStore.delete("pre-otp");
		return apiResponse("Invalid pre otp token.", 401);
	}

	const username = JSON.parse(atob(preOTPToken.split("$")[0])).username;
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

	cookieStore.delete("pre-otp");
	db.deleteOTPByType("login", preOTPToken);

	const jwtToken = jwt.createJWT(username, await db.getSecret());
	cookieStore.set("jwt", encodeURIComponent(jwtToken), { path: "/" });
	return apiResponse("Logged in successfully.");
});
