const errorMsg = document.getElementById("error-msg");

function showError(message) {
	errorMsg.style.display = "block";
	errorMsg.innerHTML = message;
}

function hideError() {
	errorMsg.style.display = "none";
}

function validateForm() {
	const username = document.getElementById("username").value.trim();
	const password = document.getElementById("password").value.trim();

	if (username === "" || password === "") {
		showError("Please enter username and password.");
		return false;
	}

	if (password.length < 8) {
		showError("Password must be at least 8 characters long.");
		return false;
	}

	// At least one uppercase
	if (!/[A-Z]/.test(password)) {
		showError("Password must contain at least one uppercase letter.");
		return false;
	}

	// At least one lowercase
	if (!/[a-z]/.test(password)) {
		showError("Password must contain at least one lowercase letter.");
		return false;
	}

	// At least one number
	if (!/[0-9]/.test(password)) {
		showError("Password must contain at least one number.");
		return false;
	}

	// At least one special character
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		showError("Password must contain at least one special character.");
		return false;
	}

	// No spaces
	if (/\s/.test(password)) {
		showError("Password must not contain spaces.");
		return false;
	}

	hideError("");
	return true;
}

async function logIn() {
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;

	try {
		const response = await fetch("/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		});

		if (!response.ok)
			throw new Error(await response.text());

		alert("Welcome " + username);
	} catch (err) {
		showError(err.message);
	}
}

async function signUp() {
	if (!validateForm()) return;
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;

	try {
		const response = await fetch("/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		});

		if (!response.ok)
			throw new Error(await response.text());

		alert("Welcome " + username);
	} catch (err) {
		showError(err.message);
	}
}

async function logOut() {
	try {
		const response = await fetch("/logout", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok)
			throw new Error(await response.text());

		alert("Successfully logged out.");
	} catch (err) {
		showError(err.message);
	}
}

async function isAuthenticated() {
	try {
		const response = await fetch("/is-authenticated", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok)
			throw new Error(await response.text());
		const { username } = await response.json();

		alert(`You are authenticated as "${username}".`);
	} catch (err) {
		alert(err.message);
	}
}
