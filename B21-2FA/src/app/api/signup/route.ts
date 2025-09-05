import { NextRequest } from "next/server";
// import { cookies } from "next/headers";
import { getUser, createUser } from "@/lib/db";
import { getHash, generateSalt } from "@/lib/hashing";
import { validateSignUp } from "@/lib/validation";

export async function POST(req: NextRequest) {
	try {
		const { username, email, password } = await req.json();
		if ((await getUser(username)) || (await getUser(email)))
			return Response.json(
				{ success: false, message: "Username or email already exists." },
				{ status: 401 }
			);
		try {
			validateSignUp(username, email, password);
		} catch (err: any) {
			return Response.json(
				{ success: false, message: err.message },
				{ status: 401 }
			);
		}
		const salt = generateSalt();
		const passwordHash = getHash(password, salt);
		createUser(username, email, passwordHash + "$" + salt);
		return Response.json({ success: true, message: "Signed Up successfully." });
	} catch (err: any) {
		return Response.json(
			{ success: false, message: err.message || "Something went wrong" },
			{ status: 500 }
		);
	}
}
