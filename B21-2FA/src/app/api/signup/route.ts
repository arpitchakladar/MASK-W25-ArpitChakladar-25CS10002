import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as hashing from "@/lib/hashing";
import * as validation from "@/lib/validation";
import * as jwt from "@/lib/jwt";
import * as otp from "@/lib/otp";

export async function POST(req: NextRequest) {
	try {
		const { username, email, password } = await req.json();
		if ((await db.getUser(username)) || (await db.getUser(email)))
			return Response.json(
				{ success: false, message: "Username or email already exists." },
				{ status: 401 }
			);
		try {
			validation.validateSignUp(username, email, password);
		} catch (err: any) {
			return Response.json(
				{ success: false, message: err.message },
				{ status: 401 }
			);
		}
		const salt = hashing.generateSalt();
		const passwordHash = hashing.getHash(password, salt);
		db.createUser(username, email, passwordHash + "$" + salt);
		const cookieStore = await cookies();
		const preOTPToken = jwt.createJWT(username, await db.getPreOTPSecret());
		cookieStore.set("pre-otp", encodeURIComponent(preOTPToken), { path: "/" });
		const currentOTP = await otp.generateOTP(preOTPToken);
		console.log(`The OTP is ${currentOTP}`);
		return Response.json({ success: true, message: "Signed Up successfully." });
	} catch (err: any) {
		console.error(err);
		return Response.json(
			{ success: false, message: err.message || "Something went wrong" },
			{ status: 500 }
		);
	}
}
