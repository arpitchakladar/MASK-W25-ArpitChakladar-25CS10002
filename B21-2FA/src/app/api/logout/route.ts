import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiResponse, withErrorHandler } from "@/lib/apiHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
	const cookieStore = await cookies();
	cookieStore.delete("jwt");
	return apiResponse("Logged out successfully.");
});
