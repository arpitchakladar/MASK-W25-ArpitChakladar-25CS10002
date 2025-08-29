module.exports.validateSignUp = ({ username, password }) => {
	if (username === "" || password === "")
		throw new Error("No username or password provided.");

	if (password.length < 8)
		throw new Error("Password must be at least 8 characters long.");

	// At least one uppercase
	if (!/[A-Z]/.test(password))
		throw new Error("Password must contain at least one uppercase letter.");

	// At least one lowercase
	if (!/[a-z]/.test(password))
		throw new Error("Password must contain at least one lowercase letter.");

	// At least one number
	if (!/[0-9]/.test(password))
		throw new Error("Password must contain at least one number.");

	// At least one special character
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
		throw new Error("Password must contain at least one special character.");

	// No spaces
	if (/\s/.test(password))
		throw new Error("Password must not contain spaces.");
};
