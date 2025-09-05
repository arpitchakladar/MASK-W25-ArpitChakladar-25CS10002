import { getHash } from "@/lib/hashing";

export function createJWT(username: string, secret: string) {
	const payload = JSON.stringify({
		username,
		expiration: Date.now() + 1000 * 60 * 60 * 24 * 90,
	});
	const jwtToken = getHash(payload, secret);
	return btoa(payload) + "$" + jwtToken;
}

export function validateJWT(jwt: string, secret: string) {
	const [payload, jwtToken] = jwt.split("$");
	const payloadString = atob(payload);
	const payloadJSON = JSON.parse(payloadString);
	console.log(payloadJSON);
	console.log(jwtToken);
	console.log(getHash(payloadString, secret));
	const currentJWTToken = getHash(payloadString, secret);
	if (payloadJSON.expiration < Date.now() || currentJWTToken !== jwtToken)
		throw new Error("Invalid jwt token found.");
}
