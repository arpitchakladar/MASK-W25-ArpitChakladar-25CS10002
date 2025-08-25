const crypto = require("crypto");
const readline = require("readline");

function generateSalt() {
	return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password, salt) {
	return crypto.createHmac("sha256", salt)
		.update(password)
		.digest("hex");
}

let users = {};

function signup(username, password) {
	if (username in users) {
		console.error(`ERROR 409: The user with username "${username}" already exists.`);
		return;
	}

	if (password.length < 8) {
		console.error("Password must be atleast 8 characters long.");
		return;
	}

	const salt = generateSalt();
	users[username] = {
		password: hashPassword(password, salt),
		salt
	};
	console.log("Account created successfully.");
}

function login(username, password) {
	const user = users[username];
	if (user === undefined || user === null) {
		console.error(`ERROR 404: No user was found with username "${username}".`);
		return;
	}

	const enteredPassword = hashPassword(password, user.salt);
	if (enteredPassword != user.password) {
		console.error(`ERROR 401: Incorrect password for ${username}.`);
		return;
	}

	console.log("Login successful!");
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

async function takeInput(message) {
	return new Promise((resolve, _) => rl.question(message, resolve));
}

(async () => {
	while (true) {
		const option = await takeInput(`1. Log In
2. Sign Up
3. Stop
Enter your choice: `);

		if (option == "1") {
			const username = await takeInput("Username: ");
			const password = await takeInput("Password: ");
			login(username, password);
		} else if (option == "2") {
			const username = await takeInput("Username: ");
			const password = await takeInput("Password: ");
			signup(username, password);
		} else if (option == "3")
			break;
		else
			console.error("Invalid option.");
		console.log("");
	}

	rl.close();
})();
