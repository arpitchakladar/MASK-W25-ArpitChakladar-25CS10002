import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as hashing from "@/lib/hashing";
import * as jwt from "@/lib/jwt";
import * as otp from "@/lib/otp";
import { apiResponse, withErrorHandler } from "@/lib/apiHandler";

type LogInRequestBody = {
	username: string;
	password: string;
};

export const POST = withErrorHandler(async (req: NextRequest) => {
	const { username, password } = (await req.json()) as LogInRequestBody;

	// Query database for users
	const user = await db.getUser(username);
	if (!user || !user.validated)
		return apiResponse("Username or password was incorrect.", 401);

	// Validate password
	const [passwordHash, salt] = user.password.split("$");
	if (passwordHash !== hashing.getHash(password, salt))
		return apiResponse("Username or password was incorrect.", 401);

	// Set preAuthToken jwt cookie
	const cookieStore = await cookies();
	const preAuthToken = jwt.createJWT(
		{ username },
		await db.getPreAuthTokenSecret()
	);
	cookieStore.set("preAuthToken", encodeURIComponent(preAuthToken), {
		path: "/",
	});

	// Generate otp
	const currentOTP = await otp.generateOTP(preAuthToken, "login");
	// TODO: Send email
	console.log(`The OTP is ${currentOTP}`);
	return apiResponse("Logged in successfully.");
});
