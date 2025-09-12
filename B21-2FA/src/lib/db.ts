import { generateSalt } from "@/lib/hashing";
import { Filter, MongoClient, UpdateFilter } from "mongodb";
import fs from "fs";

// ------------------ Types ------------------

type RecoveryCodes = {
	codes: string[];
	salt: string;
};

type User = {
	username: string;
	email: string;
	password: string;
	validated: boolean;
	signupExpiresAt?: Date;
	recoveryCodes: RecoveryCodes;
};

export type OTPType = "signup" | "login" | "recoveryEmailToken";

type OTP = {
	type: OTPType;
	token: string;
	otp: string;
	expiration: Date;
};

// ------------------ DB Setup ------------------

const dbPath = "./db";

// Ensure directory exists
if (!fs.existsSync(dbPath)) {
	fs.mkdirSync(dbPath, { recursive: true });
}

const uri = process.env.MONGODB_URI!;

const client = new MongoClient(uri);
await client.connect();

const db = client.db("B21-2FA");
const usersCollection = db.collection<User>("users");
const otpsCollection = db.collection<OTP>("otps");
const secretsCollection = db.collection<{
	preAuthTokenSecret: string;
	authTokenSecret: string;
	recoveryEmailTokenSecret: string;
	resetPasswordSecret: string;
	rememberDeviceSecret: string;
}>("secrets");

async function initDb() {
	await generateSecrets();
	// Delete expired OTPs and unvalidated users after their signupExpiresAt
	await otpsCollection.createIndex(
		{ expiration: 1 },
		{ expireAfterSeconds: 0 }
	);
	await usersCollection.createIndex(
		{ signupExpiresAt: 1 },
		{ expireAfterSeconds: 0 }
	);
}
await initDb();

// ------------------ Secrets ------------------

export async function generateSecrets() {
	if ((await secretsCollection.countDocuments({})) === 0) {
		await secretsCollection.insertOne({
			preAuthTokenSecret: generateSalt(),
			authTokenSecret: generateSalt(),
			recoveryEmailTokenSecret: generateSalt(),
			resetPasswordSecret: generateSalt(),
			rememberDeviceSecret: generateSalt(),
		});
	}
}

export async function getPreAuthTokenSecret() {
	return (await secretsCollection.findOne({}))!.preAuthTokenSecret;
}

export async function getAuthTokenSecret() {
	return (await secretsCollection.findOne({}))!.preAuthTokenSecret;
}

export async function getRecoveryEmailTokenSecret() {
	return (await secretsCollection.findOne({}))!.preAuthTokenSecret;
}

export async function getResetPasswordSecret() {
	return (await secretsCollection.findOne({}))!.preAuthTokenSecret;
}

export async function getRememberDeviceSecret() {
	return (await secretsCollection.findOne({}))!.preAuthTokenSecret;
}

// ------------------ User CRUD ------------------
export async function getUserFromUsernameOrEmail(usernameOrEmail: string) {
	return await usersCollection.findOne({
		$or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
	});
}

export async function createUser(user: User) {
	await usersCollection.insertOne(user);
}

export async function updateUser(
	user: Filter<User>,
	updates: Partial<User>,
	moreUpdates?: UpdateFilter<User>
) {
	if (
		(await usersCollection.updateOne(user, { $set: updates, ...moreUpdates }))
			.modifiedCount === 0
	)
		throw new Error("User not found");
}

export async function deleteUser(user: Filter<User>) {
	if ((await usersCollection.deleteOne(user)).deletedCount === 0)
		throw new Error("User not found");
}

// ------------------ OTP CRUD ------------------
export async function getOTP(otp: Filter<OTP>) {
	return await otpsCollection.findOne(otp);
}

export async function createOTP(otp: OTP) {
	await otpsCollection.insertOne(otp);
}

export async function updateOTP(otp: Filter<OTP>, updates: Partial<OTP>) {
	await otpsCollection.updateOne(otp, { $set: updates });
}

export async function deleteOTP(otp: Filter<OTP>) {
	if ((await otpsCollection.deleteOne(otp)).deletedCount === 0)
		throw new Error(`OTP not found.`);
}
