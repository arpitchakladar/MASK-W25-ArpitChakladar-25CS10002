import * as db from "@/lib/db";

const generate6DigitNumber = () =>
	Math.floor(100000 + Math.random() * 900000).toString();

export async function generateOTP(jwt: string) {}
