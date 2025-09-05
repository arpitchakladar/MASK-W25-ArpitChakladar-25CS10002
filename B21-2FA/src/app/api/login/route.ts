import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as db from "@/lib/db";
import * as hashing from "@/lib/hashing";
import * as jwt from "@/lib/jwt";

export async function POST(req: NextRequest) {
	try {
		const { username, password } = await req.json();
		const user = await db.getUser(username);
		if (!user)
			return Response.json(
				{ success: false, message: "User not found!" },
				{ status: 404 }
			);
		const [passwordHash, salt] = user.password.split("$");
		if (passwordHash !== hashing.getHash(password, salt))
			return Response.json(
				{ success: false, message: "Incorrect password!" },
				{ status: 401 }
			);
		const cookieStore = await cookies();
		const preOTPToken = jwt.createJWT(username, await db.getPreOTPSecret());
		cookieStore.set("pre-otp", encodeURIComponent(preOTPToken), { path: "/" });
		return Response.json({ success: true, message: "Logged in successfully." });
	} catch (err: any) {
		return Response.json(
			{ success: false, message: err.message || "Something went wrong" },
			{ status: 500 }
		);
	}
}
