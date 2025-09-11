import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as hashing from "@/lib/hashing";
import * as jwt from "@/lib/jwt";
import * as otp from "@/lib/otp";
import { apiResponse, withErrorHandler } from "@/lib/apiHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { username, recoveryCode } = await req.json();

	const user = await db.getUser(username);
	if (!user || !user.validated) return apiResponse("User not found.", 404);

	return apiResponse("Logged in successfully.");
});
