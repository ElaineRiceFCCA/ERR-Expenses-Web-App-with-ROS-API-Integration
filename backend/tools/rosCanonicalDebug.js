import crypto from "crypto";

/*
 ROS Canonical Request Debug Utility
 ----------------------------------------------------
 Displays the exact canonical request string used
 for Revenue HTTP Signature verification.

 Purpose:
  1. Debug signature mismatches
  2. Validate canonical header ordering
  3. Confirm SHA-512 digest generation
  4. Inspect raw payload bytes

 This mirrors the structure Revenue expects when
 verifying the HTTP Signature header.
 */

export function debugRosCanonical({
  method,
  requestTarget,
  host,
  date,
  payloadBuffer,
}) {
  // Compute SHA-512 payload digest (Revenue requirement)
  const digest =
    "SHA-512=" +
    crypto.createHash("sha512").update(payloadBuffer).digest("base64");

  // Build canonical signing string in required order:
  // (request-target)
  // host
  // date
  // digest
  const signingString = [
    `(request-target): ${method.toLowerCase()} ${requestTarget}`,
    `host: ${host}`,
    `date: ${date}`,
    `digest: ${digest}`,
  ].join("\n");

  // Structured debug output
  console.log("\n========== ROS CANONICAL REQUEST ==========\n");

  console.log("REQUEST TARGET");
  console.log(`${method} ${requestTarget}`);

  console.log("\n========== HEADERS USED IN SIGNATURE ==========\n");

  console.log("(request-target):", method.toLowerCase(), requestTarget);
  console.log("host:", host);
  console.log("date:", date);
  console.log("digest:", digest);

  console.log("\n========== SIGNING STRING ==========\n");
  console.log(signingString);

  console.log("\n========== PAYLOAD BYTES ==========\n");
  console.log(payloadBuffer);

  console.log("\n========== PAYLOAD STRING ==========\n");
  console.log(payloadBuffer.toString());

  console.log("\n===========================================\n");

  // Return computed values for programmatic inspection
  return {
    digest,
    signingString,
  };
}
