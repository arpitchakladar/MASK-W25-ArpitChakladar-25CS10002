import { NextRequest } from "next/server";
// import { cookies } from "next/headers";
import { getUser } from "@/lib/db";
import { getHash } from "@/lib/hashing";

export async function POST(req: NextRequest) {
	try {
		const { username, password } = await req.json();
		const user = await getUser(username);
		if (!user)
			return Response.json(
				{ success: false, error: "User not found!" },
				{ status: 404 }
			);
		const [passwordHash, salt] = user.password.split("$");
		if (passwordHash !== getHash(password, salt))
			return Response.json(
				{ success: false, error: "Incorrect password!" },
				{ status: 401 }
			);
		return Response.json({ success: true, message: "Logged in successfully." });
	} catch (err: any) {
		return Response.json(
			{ success: false, error: err.message || "Something went wrong" },
			{ status: 500 }
		);
	}
}
