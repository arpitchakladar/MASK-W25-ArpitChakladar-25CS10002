import { getHash } from "@/lib/hashing";

export function createJWT(
	payload: Record<string, any>,
	secret: string,
	expirationInMs = 1000 * 60 * 60 * 24 * 90
) {
	const payloadString = JSON.stringify({
		...payload,
		expiration: Date.now() + expirationInMs,
	});
	const jwtToken = getHash(payloadString, secret);
	return btoa(payloadString) + "$" + jwtToken;
}

export function validateJWT(jwt: string, secret: string) {
	const [payload, jwtToken] = jwt.split("$");
	const payloadString = atob(payload);
	const payloadJSON = JSON.parse(payloadString);
	const currentJWTToken = getHash(payloadString, secret);
	if (payloadJSON.expiration < Date.now() || currentJWTToken !== jwtToken)
		throw new Error("Invalid jwt token found.");
}
