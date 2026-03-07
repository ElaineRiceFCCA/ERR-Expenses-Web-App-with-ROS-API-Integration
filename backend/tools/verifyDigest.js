import crypto from "crypto";
import fs from "fs";

/*
 Revenue Digest Verification Utility
 ----------------------------------------------------
 Purpose:
  1. Validates payload integrity
  2. Confirms correct SHA-512 hashing format
  3. Assists debugging of Revenue HTTP Digest header
  
  This utility computes SHA-512 digest for a JSON payload file.
*/

// Extract file path from CLI arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node verifyDigest.js <jsonFile>");
  process.exit(1);
}

// Read raw file bytes (no transformation)
const payload = fs.readFileSync(filePath);

// Compute SHA-512 hash of payload
// Format must match Revenue specification:
// Digest: SHA-512=<Base64Hash>
const digest =
  "SHA-512=" + crypto.createHash("sha512").update(payload).digest("base64");

// Output metadata for verification
console.log("\nPayload bytes:", payload.length);
console.log("Digest:", digest);

// Output payload preview for manual inspection
console.log("\nPayload preview:");
console.log(payload.toString());
