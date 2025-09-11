import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as hashing from "@/lib/hashing";
import * as jwt from "@/lib/jwt";
import { apiResponse, withErrorHandler } from "@/lib/apiHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { password } = await req.json();

	const cookieStore = await cookies();
	const resetPasswordToken = decodeURIComponent(
		cookieStore.get("resetPasswordToken")?.value || ""
	);

	try {
		jwt.validateJWT(resetPasswordToken, await db.getResetPasswordSecret());
	} catch (err: any) {
		cookieStore.delete("resetPasswordToken");
		return apiResponse("Invalid reset password token.", 401);
	}
	cookieStore.delete("resetPasswordToken");
	const username = JSON.parse(atob(resetPasswordToken.split("$")[0])).username;
	const salt = hashing.generateSalt();
	const passwordHash = hashing.getHash(password, salt);
	await db.updateUser(username, {
		password: passwordHash + "$" + salt,
	});

	return apiResponse("Password reset was successful.");
});
