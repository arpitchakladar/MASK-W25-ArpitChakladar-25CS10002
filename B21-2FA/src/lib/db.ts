import { generateSalt } from "@/lib/hashing";
import { MongoClient } from "mongodb";
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
	recoveryCodes: RecoveryCodes;
};

export type OTPType = "signup" | "login" | "recoveryEmailToken";

type OTP = {
	type: OTPType;
	token: string;
	otp: string;
	expiration: number;
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

// TODO: Use mongo collections instead of lowdb
async function initDb() {
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
await initDb();

// ------------------ Secrets ------------------

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

// TODO: Use mongo collections instead of lowdb
export async function getUser(usernameOrEmail: string) {
	return await usersCollection.findOne({
		$or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
	});
}

export async function createUser(user: User) {
	await usersCollection.insertOne(user);
}

export async function updateUser(username: string, updates: Partial<User>) {
	if (
		(await usersCollection.updateOne({ username }, { $set: updates }))
			.modifiedCount === 0
	)
		throw new Error("User not found");
}

export async function deleteUser(username: string) {
	if ((await usersCollection.deleteOne({ username })).deletedCount === 0)
		throw new Error("User not found");
}

// ------------------ OTP CRUD ------------------

// TODO: Use mongo collections instead of lowdb
export async function getOTP(otp: Partial<OTP>) {
	return await otpsCollection.findOne(otp);
}

export async function createOTP(otp: OTP) {
	await otpsCollection.insertOne(otp);
}

export async function updateOTP(otp: Partial<OTP>, updates: Partial<OTP>) {
	await otpsCollection.updateOne(otp, { $set: updates });
}

export async function deleteOTP(otp: Partial<OTP>) {
	if ((await otpsCollection.deleteOne(otp)).deletedCount === 0)
		throw new Error(`OTP not found.`);
}
