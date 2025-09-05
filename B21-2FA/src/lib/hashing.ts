function simpleHash(str: string): string {
	const ROUNDS = 8;
	let hash = "";
	let input = str;

	for (let r = 0; r < ROUNDS; r++) {
		let h = 0;
		for (let i = 0; i < input.length; i++) {
			h = (h ^ input.charCodeAt(i)) * 16777619;
			h = h >>> 0;
		}
		hash += h.toString(16).padStart(8, "0");
		input = hash;
	}

	return hash;
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
