import { NextResponse } from "next/server";

export function withErrorHandler(handler: Function) {
	return async (...args: any[]) => {
		try {
			return await handler(...args);
		} catch (err: any) {
			console.error("API Error:", err);
			return NextResponse.json(
				{ error: "Internal Server Error" },
				{ status: 500 }
			);
		}
	};
}

export function apiResponse(message: string, status = 200, data = {}) {
	return Response.json({ message, success: status < 400, ...data }, { status });
}
