import { promises as fs } from "fs";
import { generateSalt } from "@/lib/hashing";
import { setInterval } from "timers/promises";

const DB_FILE = "db.json";

type User = {
	username: string;
	email: string;
	password: string;
	validated: boolean;
};

type OTP = {
	preOTPToken: string;
	otp: string;
	expiration: number;
	validation: boolean;
};

type Database = {
	users: User[];
	otps: OTP[];
	preOTPSecret: string;
	secret: string;
};

// ------------------ DB Helpers ------------------

async function readDb(): Promise<Database> {
	try {
		const content = await fs.readFile(DB_FILE, "utf-8");
		const database = JSON.parse(content) || {};
		database.users ||= [];
		database.otps ||= [];
		return database;
	} catch (err: any) {
		if (err.code === "ENOENT") {
			const database: Database = {
				users: [],
				otps: [],
				preOTPSecret: generateSalt(),
				secret: generateSalt(),
			};
			await writeDb(database);
			return database;
		}
		throw err;
	}
}

async function writeDb(data: Database): Promise<void> {
	await fs.writeFile(DB_FILE, JSON.stringify(data, null, "\t"), "utf-8");
}

// ------------------ Secrets ------------------

export async function getPreOTPSecret() {
	const database = await readDb();
	return database.preOTPSecret;
}

export async function getSecret() {
	const database = await readDb();
	return database.secret;
}

// ------------------ User CRUD ------------------

export async function getUser(usernameOrEmail: string) {
	const database = await readDb();
	return database.users.find(
		(user) =>
			user.username === usernameOrEmail || user.email === usernameOrEmail
	);
}

export async function createUser(user: User) {
	const database = await readDb();
	const exists = database.users.find(
		(u) => u.username === user.username || u.email === user.email
	);
	if (exists) throw new Error("User already exists");
	database.users.push(user);
	await writeDb(database);
}

export async function updateUser(username: string, updates: Partial<User>) {
	const database = await readDb();
	const user = database.users.find((u) => u.username === username);
	if (!user) throw new Error("User not found");
	Object.assign(user, updates);
	await writeDb(database);
	return user;
}

export async function deleteUser(username: string) {
	const database = await readDb();
	const before = database.users.length;
	database.users = database.users.filter((u) => u.username !== username);
	if (database.users.length === before) throw new Error("User not found");
	await writeDb(database);
}

// ------------------ OTP CRUD ------------------

export async function getOTP(preOTPToken: string) {
	const database = await readDb();
	return database.otps.find((otp) => otp.preOTPToken === preOTPToken);
}

export async function createOTP(otp: OTP) {
	const database = await readDb();
	const exists = database.otps.find((o) => o.preOTPToken === otp.preOTPToken);
	if (exists) throw new Error("OTP already exists for this token");
	database.otps.push(otp);
	await writeDb(database);
}

export async function updateOTP(preOTPToken: string, updates: Partial<OTP>) {
	const database = await readDb();
	const entry = database.otps.find((o) => o.preOTPToken === preOTPToken);
	if (!entry) throw new Error("OTP not found");
	Object.assign(entry, updates);
	await writeDb(database);
	return entry;
}

export async function deleteOTP(preOTPToken: string) {
	const database = await readDb();
	const before = database.otps.length;
	database.otps = database.otps.filter((o) => o.preOTPToken !== preOTPToken);
	if (database.otps.length === before) throw new Error("OTP not found");
	await writeDb(database);
}

// ------------------ Cleanup ------------------

// Remove expired OTPs every 30mins
setInterval(1000 * 60 * 30, async () => {
	const database = await readDb();
	const curDate = Date.now();
	database.otps = database.otps.filter((otp) => otp.expiration > curDate);
	await writeDb(database);
});

// TODO: Clean up unvalidated accounts
