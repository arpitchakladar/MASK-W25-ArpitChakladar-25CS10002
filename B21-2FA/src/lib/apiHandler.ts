export function withErrorHandler(handler: Function) {
	return async (...args: any[]) => {
		try {
			return await handler(...args);
		} catch (err: any) {
			console.error("---------- API Error ----------\n", err);
			return apiResponse("Internal Server Error", 500);
		}
	};
}

export function apiResponse(message: string, status = 200, data = {}) {
	return Response.json({ message, success: status < 400, ...data }, { status });
}

export async function apiRequest(url: string, body: object) {
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const data = await res.json();
		return { ok: res.ok, data };
	} catch {
		return { ok: false, data: { message: "Something went wrong." } };
	}
}
