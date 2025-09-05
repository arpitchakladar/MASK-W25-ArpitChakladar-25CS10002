import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'http://**:8083', // your LAN IP
    'http://localhost:8083',       // still allow localhost
  ],
};

export default nextConfig;
