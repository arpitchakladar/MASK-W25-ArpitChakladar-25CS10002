import { promises as fs } from "fs";
import { generateSalt, getHash } from "@/lib/hashing";

const DB_FILE = "db.json";

type User = {
	username: string;
	email: string;
	password: string;
};

type Database = {
	users: User[];
};

async function readDb(): Promise<Database> {
	try {
		const content = await fs.readFile(DB_FILE, "utf-8");
		return JSON.parse(content);
	} catch (err: any) {
		if (err.code === "ENOENT") {
			return { users: [] }; // file not found → start empty
		}
		throw err;
	}
}

async function writeDb(data: Database): Promise<void> {
	await fs.writeFile(DB_FILE, JSON.stringify(data, null, "\t"), "utf-8");
}

export async function getUser(username: string) {
	const database = await readDb();
	return database.users.find((user) => user.username === username);
}

export async function createUser(
	username: string,
	email: string,
	password: string
) {
	const database = await readDb();
	if (
		database.users.find(
			(user) => user.username === username || user.email === email
		)
	)
		throw new Error("User with the given username or email already exists.");
	const salt = generateSalt();
	database.users.push({
		username,
		email,
		password: getHash(password, salt) + "$" + salt,
	});
	await writeDb(database);
}
