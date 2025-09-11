export function generateRecoveryCodes(count = 10): string[] {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	const codes: string[] = [];

	for (let i = 0; i < count; i++) {
		let code = "";
		for (let j = 0; j < 8; j++) {
			code += chars[Math.floor(Math.random() * chars.length)];
		}
		// Insert dash in the middle (4-4 split)
		codes.push(code.slice(0, 4) + "-" + code.slice(4));
	}

	return codes;
}
