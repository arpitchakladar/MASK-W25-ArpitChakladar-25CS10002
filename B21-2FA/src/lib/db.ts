import { promises as fs } from "fs";
import { generateSalt } from "@/lib/hashing";

const DB_FILE = "db.json";

type User = {
	username: string;
	email: string;
	password: string;
};

type OTP = {
	jwt: string;
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

export async function createOTP(jwt: string, expiration: number, otp: string) {
	const database = await readDb();
	database.otps.push({
		otp,
		expiration,
		jwt,
	});
}
