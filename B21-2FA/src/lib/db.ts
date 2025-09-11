import { promises as fs } from "fs";
import { generateSalt } from "@/lib/hashing";
import { setInterval } from "timers/promises";

const DB_FILE = "db.json";

type RecoveryCodes = {
	codes: string[];
	salt: string;
};

type User = {
	username: string;
	email: string;
	password: string;
	validated: boolean;
	recoveryCodes: RecoveryCodes;
};

type OTP = {
	token: string;
	otp: string;
	expiration: number;
};

type Database = {
	users: User[];
	otps: {
		signup: OTP[];
		login: OTP[];
		recoveryEmailToken: OTP[];
	};
	preAuthTokenSecret: string;
	authTokenSecret: string;
	recoveryEmailTokenSecret: string;
	resetPasswordSecret: string;
};

export type OTPType = keyof Database["otps"];

// ------------------ DB Helpers ------------------

async function readDb(): Promise<Database> {
	try {
		const content = await fs.readFile(DB_FILE, "utf-8");
		const database = JSON.parse(content.trim()) || {};
		database.users ||= [];
		database.otps ||= [];
		return database;
	} catch (err: any) {
		if (err.code === "ENOENT" || err instanceof SyntaxError) {
			const database: Database = {
				users: [],
				otps: {
					signup: [],
					login: [],
					recoveryEmailToken: [],
				},
				preAuthTokenSecret: generateSalt(),
				authTokenSecret: generateSalt(),
				recoveryEmailTokenSecret: generateSalt(),
				resetPasswordSecret: generateSalt(),
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

export async function getPreAuthTokenSecret() {
	const database = await readDb();
	return database.preAuthTokenSecret;
}
export async function getAuthTokenSecret() {
	const database = await readDb();
	return database.authTokenSecret;
}
export async function getRecoveryEmailTokenSecret() {
	const database = await readDb();
	return database.recoveryEmailTokenSecret;
}
export async function getResetPasswordSecret() {
	const database = await readDb();
	return database.resetPasswordSecret;
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

// ------------------ OTP CRUD per type ------------------

export async function getOTPsByType(type: OTPType) {
	const database = await readDb();
	return database.otps[type];
}

export async function getOTPByType(type: OTPType, token: string) {
	const database = await readDb();
	return database.otps[type].find((o) => o.token === token);
}

export async function createOTPByType(type: OTPType, otp: OTP) {
	const database = await readDb();
	const exists = database.otps[type].find((o) => o.token === otp.token);
	if (exists) throw new Error(`OTP already exists for this token in ${type}`);
	database.otps[type].push(otp);
	await writeDb(database);
}

export async function updateOTPByType(
	type: OTPType,
	token: string,
	updates: Partial<OTP>
) {
	const database = await readDb();
	const entry = database.otps[type].find((o) => o.token === token);
	if (!entry) throw new Error(`OTP not found in ${type}`);
	Object.assign(entry, updates);
	await writeDb(database);
	return entry;
}

export async function deleteOTPByType(type: OTPType, token: string) {
	const database = await readDb();
	const before = database.otps[type].length;
	database.otps[type] = database.otps[type].filter((o) => o.token !== token);
	if (database.otps[type].length === before)
		throw new Error(`OTP not found in ${type}`);
	await writeDb(database);
}

// ------------------ Cleanup ------------------

// Remove expired OTPs every 30mins
// Remove expired OTPs every 30 minutes
setInterval(1000 * 60 * 30, async () => {
	const database = await readDb();
	const curDate = Date.now();

	// Loop through each OTP type and filter out expired ones
	for (const type of Object.keys(database.otps) as OTPType[]) {
		database.otps[type] = database.otps[type].filter(
			(otp) => otp.expiration > curDate
		);
	}

	await writeDb(database);
});

// TODO: Clean up unvalidated accounts
