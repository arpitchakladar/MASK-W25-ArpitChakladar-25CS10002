import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: [
		"http://192.168.226.129:8083", // your LAN IP
		"http://localhost:8083", // still allow localhost
	],
};

export default nextConfig;
