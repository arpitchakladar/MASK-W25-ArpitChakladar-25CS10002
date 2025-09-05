export function validateSignUp(
	username: string,
	email: string,
	password: string
) {
	if (!username) throw new Error("No username was provided.");
	if (!email) throw new Error("No email was provided.");
	if (!password) throw new Error("No password was provided.");

	if (password.length < 8)
		throw new Error("Password must be at least 8 characters long.");

	if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
		throw new Error("Invalid email.");

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
	if (/\s/.test(password)) throw new Error("Password must not contain spaces.");
}
