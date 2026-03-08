// Test script: calls /api/test-generate on production (or local)
// Usage: npm run test:gen
// Usage (local): npm run test:gen -- --local

import { config } from "dotenv";
import { readFileSync } from "fs";

// Load env
try {
  const env = readFileSync(".env.local", "utf8");
  env.split("\n").forEach((line) => {
    const [key, ...val] = line.split("=");
    if (key && val.length) process.env[key.trim()] = val.join("=").trim();
  });
} catch {}

const isLocal = process.argv.includes("--local");
const BASE_URL = isLocal ? "http://localhost:3000" : "https://website-three-zeta-38.vercel.app";
const secret = process.env.ADMIN_SECRET;

if (!secret) {
  console.error("❌ ADMIN_SECRET manquant dans .env.local");
  process.exit(1);
}

console.log(`🚀 Test génération sur ${BASE_URL}...`);

const res = await fetch(`${BASE_URL}/api/test-generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ secret, sendEmail: false }),
});

const data = await res.json();

if (data.success) {
  console.log(`✅ Succès ! Commande: ${data.orderId}`);
  console.log(`🔗 Preview: ${BASE_URL}${data.previewUrl}`);
} else {
  console.error("❌ Erreur:", data.error || JSON.stringify(data));
  if (data.orderId) {
    console.log(`   Order ID: ${data.orderId}`);
  }
}
