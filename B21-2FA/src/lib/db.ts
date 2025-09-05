import { promises as fs } from "fs";
import { generateSalt } from "@/lib/hashing";
import { setInterval } from "timers/promises";

const DB_FILE = "db.json";

type User = {
	username: string;
	email: string;
	password: string;
};

type OTP = {
	preOTPToken: string;
	otp: string;
	expiration: number;
};

type Database = {
	users: User[];
	otps: OTP[];
	preOTPSecret: string;
	secret: string;
};

async function readDb(): Promise<Database> {
	try {
		const content = await fs.readFile(DB_FILE, "utf-8");
		const database = JSON.parse(content) || {};
		database.users ||= [];
		database.otps ||= [];
		return database;
	} catch (err: any) {
		if (err.code === "ENOENT") {
			const database = {
				users: [],
				otps: [],
				preOTPSecret: generateSalt(),
				secret: generateSalt(),
			}; // file not found → start empty
			await writeDb(database);
			return database;
		}
		throw err;
	}
}

async function writeDb(data: Database): Promise<void> {
	await fs.writeFile(DB_FILE, JSON.stringify(data, null, "\t"), "utf-8");
}

export async function getPreOTPSecret() {
	const database = await readDb();
	return database.preOTPSecret;
}

export async function getSecret() {
	const database = await readDb();
	return database.secret;
}

export async function getUser(usernameOrEmail: string) {
	const database = await readDb();
	return database.users.find(
		(user) =>
			user.username === usernameOrEmail || user.email === usernameOrEmail
	);
}

export async function createUser(
	username: string,
	email: string,
	password: string
) {
	const database = await readDb();
	database.users.push({
		username,
		email,
		password,
	});
	await writeDb(database);
}

export async function createOTP(
	preOTPToken: string,
	expiration: number,
	otp: string
) {
	const database = await readDb();
	const prev = database.otps.find((otp) => otp.preOTPToken === preOTPToken);
	if (prev) {
		prev.otp = otp;
		prev.expiration = expiration;
	} else {
		database.otps.push({
			otp,
			expiration,
			preOTPToken,
		});
	}
	await writeDb(database);
}

export async function getOTP(preOTPToken: string) {
	const database = await readDb();
	return database.otps.find((otp) => otp.preOTPToken === preOTPToken);
}

export async function removeOTP(preOTPToken: string) {
	const database = await readDb();
	database.otps = database.otps.filter(
		(otp) => otp.preOTPToken !== preOTPToken
	);
	await writeDb(database);
}

// Remove expired OTPs every 30mins
setInterval(1000 * 60 * 30, async () => {
	const database = await readDb();
	const curDate = Date.now();
	database.otps = database.otps.filter((otp) => otp.expiration > curDate);
	await writeDb(database);
});
