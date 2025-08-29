const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const auth = require("./auth.js");
const validation = require("./validation.js");
const app = express();
const port = 8081;

app.use("/public", express.static(path.resolve(__dirname, "..", "public")));

app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
	res.sendFile(path.resolve(__dirname, "..", "public", "index.html"));
});

app.post("/login", (req, res) => {
	const { username, password } = req.body;
	try {
		const jwt = auth.logIn(username, password);

		res.cookie("jwt", jwt, {
			path: "/",
			httpOnly: true,
			secure: false,
			maxAge: 1000 * 60 * 60 * 24 * 12 * 3
		});
		res.status(200).send("Logged in successfully.");
	} catch(err) {
		res.status(401).send(err.message);
	}
});

app.post("/signup", (req, res) => {
	const { username, password } = req.body;
	try {
		validation.validateSignUp({ username, password });
		const jwt = auth.signUp(username, password);

		res.cookie("jwt", jwt, {
			path: "/",
			httpOnly: true,
			secure: false,
			maxAge: 1000 * 60 * 60 * 24 * 12 * 3
		});
		res.status(200).send("Signed up successfully.");
	} catch(err) {
		res.status(401).send(err.message);
	}
});

app.post("/logout", (req, res) => {
	res.clearCookie("jwt", { path: "/" });
	res.status(200).send("Successfully logged out.");
});

app.post("/is-authenticated", (req, res) => {
	if (!req.cookies?.jwt) {
		res.status(401).send("You are unauthenticated.");
		return;
	}
	const username = JSON.parse(atob(req.cookies.jwt.split("-")[0])).username;

	if (auth.validateJWT(req.cookies.jwt))
		res.status(200).json({ username });
	else {
		res.clearCookie("jwt", { path: "/" });
		res.status(401).send("Your session is invalid or has expired.");
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
