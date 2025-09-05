function simpleHash(str: string): string {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = (h ^ str.charCodeAt(i)) * 16777619;
		h = h >>> 0;
	}
	return h.toString(16).padStart(8, "0");
}

export function getHash(payload: string, salt: string): string {
	const ITERATIONS = 1000;
	let key = payload + salt;
	for (let i = 0; i < ITERATIONS; i++) {
		key = simpleHash(key + salt);
	}
	return key;
}

export function generateSalt(length: number = 32): string {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	return Array.from(
		{ length },
		() => chars[Math.floor(Math.random() * chars.length)]
	).join("");
}
