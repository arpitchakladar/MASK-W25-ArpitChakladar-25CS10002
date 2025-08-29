const crypto = require("crypto");

const secret = crypto.randomBytes(32).toString("hex");;
let users = {};

function generateSalt() {
	return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password, salt) {
	return crypto.createHmac("sha256", salt)
		.update(password)
		.digest("hex");
}

function hashJWT(payload) {
	return crypto.createHmac("sha256", secret)
		.update(payload)
		.digest("hex");
}

function generateJWTToken(username) {
	const payload = JSON.stringify({
		username,
		// 3 months from creation
		expiration: Date.now() + 1000 * 60 * 60 * 24 * 12 * 3
	});
	const jwt = hashJWT(payload);
	return btoa(payload) + "-" + jwt;
}

module.exports.signUp = (username, password) => {
	if (username in users)
		throw new Error(`A user with username "${username}" already exists.`);

	const salt = generateSalt();
	const hashedPassword = hashPassword(password, salt);
	users[username] = {
		password: hashedPassword,
		salt
	};
	return generateJWTToken(username);
}

module.exports.logIn = (username, password) => {
	if (!(username in users))
		throw new Error(`Username or password was incorrect.`);
	const user = users[username];
	const hashedPassword = hashPassword(password, user.salt);
	if (hashedPassword !== user.password)
		throw new Error(`Username or password was incorrect.`);

	return generateJWTToken(username);
}

module.exports.validateJWT = jwt => {
	const splitted = jwt.split("-");
	const payload = atob(splitted[0]);
	const payloadJson = JSON.parse(payload);
	const token = splitted[1];
	if (payloadJson.username in users &&
		payloadJson.expiration > Date.now() &&
		hashJWT(payload) === token
	)
		return true;
	else
		return false;
};
