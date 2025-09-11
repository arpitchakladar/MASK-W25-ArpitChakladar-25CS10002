import { NextRequest } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

export const ipLimiter = new RateLimiterMemory({
	points: 5,
	duration: 15 * 60,
});

export const userLimiter = new RateLimiterMemory({
	points: 5,
	duration: 15 * 60,
});

export const emailLimiter = new RateLimiterMemory({
	points: 5,
	duration: 15 * 60,
});

export function getClientIp(req: NextRequest): string {
	return (
		req.headers.get("x-real-ip")?.split(",")[0]?.trim() ||
		req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		"unknown-ip"
	);
}
