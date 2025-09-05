import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as jwt from "@/lib/jwt";

export async function POST(req: NextRequest) {
	try {
		const { otp: reqOTP } = await req.json();
		const cookieStore = await cookies();
		const preOTPToken = decodeURIComponent(
			cookieStore.get("pre-otp")?.value || ""
		);
		try {
			jwt.validateJWT(preOTPToken, await db.getPreOTPSecret());
		} catch (err: any) {
			cookieStore.delete("pre-otp");
			return Response.json(
				{
					success: false,
					message: "Invalid pre otp token.",
				},
				{ status: 401 }
			);
		}
		const otpEntry = await db.getOTP(preOTPToken);
		if (!otpEntry || otpEntry.otp !== reqOTP)
			return Response.json(
				{ success: false, message: "Invalid OTP." },
				{ status: 401 }
			);
		if (otpEntry.expiration < Date.now()) {
			cookieStore.delete("pre-otp");
			return Response.json(
				{ success: false, message: "OTP timeout." },
				{ status: 401 }
			);
		}
		cookieStore.delete("pre-otp");
		const username = JSON.parse(atob(preOTPToken.split("$")[0])).username;
		const jwtToken = jwt.createJWT(username, await db.getSecret());
		cookieStore.set("jwt", encodeURIComponent(jwtToken), { path: "/" });
		db.removeOTP(preOTPToken);
		return Response.json({ success: true, message: "Logged in successfully." });
	} catch (err: any) {
		console.error(err);
		return Response.json(
			{ success: false, message: err.message || "Something went wrong" },
			{ status: 500 }
		);
	}
}
