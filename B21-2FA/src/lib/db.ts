import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { generateSalt } from "@/lib/hashing";

// ------------------ Types ------------------

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

// ------------------ DB Setup ------------------

const adapter = new JSONFile<Database>(DB_FILE);
const db = new Low<Database>(adapter, {
	users: [],
	otps: { signup: [], login: [], recoveryEmailToken: [] },
	preAuthTokenSecret: generateSalt(),
	authTokenSecret: generateSalt(),
	recoveryEmailTokenSecret: generateSalt(),
	resetPasswordSecret: generateSalt(),
});

async function initDb() {
	await db.read();
	db.data ||= {
		users: [],
		otps: { signup: [], login: [], recoveryEmailToken: [] },
		preAuthTokenSecret: generateSalt(),
		authTokenSecret: generateSalt(),
		recoveryEmailTokenSecret: generateSalt(),
		resetPasswordSecret: generateSalt(),
	};
	await db.write();
}
await initDb();

// ------------------ Secrets ------------------

export async function getPreAuthTokenSecret() {
	await db.read();
	return db.data!.preAuthTokenSecret;
}
export async function getAuthTokenSecret() {
	await db.read();
	return db.data!.authTokenSecret;
}
export async function getRecoveryEmailTokenSecret() {
	await db.read();
	return db.data!.recoveryEmailTokenSecret;
}
export async function getResetPasswordSecret() {
	await db.read();
	return db.data!.resetPasswordSecret;
}

// ------------------ User CRUD ------------------

export async function getUser(usernameOrEmail: string) {
	await db.read();
	return db.data!.users.find(
		(user) =>
			user.username === usernameOrEmail || user.email === usernameOrEmail
	);
}

export async function createUser(user: User) {
	await db.read();
	const exists = db.data!.users.find(
		(u) => u.username === user.username || u.email === user.email
	);
	if (exists) throw new Error("User already exists");
	db.data!.users.push(user);
	await db.write();
}

export async function updateUser(username: string, updates: Partial<User>) {
	await db.read();
	const user = db.data!.users.find((u) => u.username === username);
	if (!user) throw new Error("User not found");
	Object.assign(user, updates);
	await db.write();
	return user;
}

export async function deleteUser(username: string) {
	await db.read();
	const before = db.data!.users.length;
	db.data!.users = db.data!.users.filter((u) => u.username !== username);
	if (db.data!.users.length === before) throw new Error("User not found");
	await db.write();
}

// ------------------ OTP CRUD ------------------

export async function getOTPsByType(type: OTPType) {
	await db.read();
	return db.data!.otps[type];
}

export async function getOTPByType(type: OTPType, token: string) {
	await db.read();
	return db.data!.otps[type].find((o) => o.token === token);
}

export async function createOTPByType(type: OTPType, otp: OTP) {
	await db.read();
	const exists = db.data!.otps[type].find((o) => o.token === otp.token);
	if (exists) throw new Error(`OTP already exists for this token in ${type}`);
	db.data!.otps[type].push(otp);
	await db.write();
}

export async function updateOTPByType(
	type: OTPType,
	token: string,
	updates: Partial<OTP>
) {
	await db.read();
	const entry = db.data!.otps[type].find((o) => o.token === token);
	if (!entry) throw new Error(`OTP not found in ${type}`);
	Object.assign(entry, updates);
	await db.write();
	return entry;
}

export async function deleteOTPByType(type: OTPType, token: string) {
	await db.read();
	const before = db.data!.otps[type].length;
	db.data!.otps[type] = db.data!.otps[type].filter((o) => o.token !== token);
	if (db.data!.otps[type].length === before)
		throw new Error(`OTP not found in ${type}`);
	await db.write();
}

// ------------------ Cleanup ------------------

// Remove expired OTPs every 30 minutes
setInterval(async () => {
	await db.read();
	const curDate = Date.now();
	for (const type of Object.keys(db.data!.otps) as OTPType[]) {
		db.data!.otps[type] = db.data!.otps[type].filter(
			(otp) => otp.expiration > curDate
		);
	}
	await db.write();
}, 1000 * 60 * 30);

// TODO: Clean up unvalidated accounts
