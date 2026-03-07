// ----------------------------------------------------
// Revenue ERR Submission Client
// ----------------------------------------------------
// Handles full ERR submission flow to Revenue ROS:
//  1. Builds canonical request
//  2. Computes SHA-512 Digest header
//  3. Calls .NET signing microservice (RSA-SHA512)
//  4. Constructs HTTP Signature header
//  5. Sends signed HTTPS request to ROS
//  6. Returns structured response with trace metadata
// ----------------------------------------------------

import crypto from "crypto";
import https from "https";
import { URL } from "url";
import { debugRosCanonical } from "../tools/rosCanonicalDebug.js";

// Cache certificate metadata to avoid repeated /cert-info calls
let cachedKeyId = null;
let cachedCertPem = null;

// Convert Base64 certificate string into PEM format
function base64ToPemCert(base64) {
  const cleaned = String(base64 || "").replace(/\s+/g, "");
  const lines = cleaned.match(/.{1,64}/g) || [];
  return `-----BEGIN CERTIFICATE-----\n${lines.join("\n")}\n-----END CERTIFICATE-----\n`;
}

// Generate RFC-compliant HTTP Date header
function nowHttpDate() {
  return new Date().toUTCString();
}

/*
 Compute SHA-512 Digest header value

 Revenue example requires:
   Digest: <bare base64>

 NOTE:
 Revenue documentation example does NOT prefix with "SHA-512="
 */
function computeDigestHeaderValue(payloadBuffer) {
  return crypto.createHash("sha512").update(payloadBuffer).digest("base64");
}

// Build canonical signing string in strict header order
// Must match "headers" parameter in Signature header
function buildSigningString({ method, requestTarget, host, date, digest }) {
  return [
    `(request-target): ${method.toLowerCase()} ${requestTarget}`,
    `host: ${host}`,
    `date: ${date}`,
    `digest: ${digest}`,
  ].join("\n");
}

// Optional local verification of signature using public certificate
// Used to confirm signature correctness before sending to Revenue
function verifySignatureLocally({ certPem, signingString, signatureBase64 }) {
  try {
    const sig = Buffer.from(signatureBase64, "base64");
    return crypto.verify(
      "RSA-SHA512",
      Buffer.from(signingString, "utf8"),
      certPem,
      sig,
    );
  } catch {
    return false;
  }
}

// Load certificate metadata from .NET signing service
// Caches Base64 public cert (used as keyId) and PEM version
async function loadCertInfoFromDotNet(baseUrl) {
  if (cachedKeyId && cachedCertPem) {
    return { keyId: cachedKeyId, certPem: cachedCertPem };
  }

  const res = await fetch(`${baseUrl}/cert-info`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Signing service cert-info failed (${res.status}): ${text}`,
    );
  }

  const data = await res.json();
  if (!data?.base64) {
    throw new Error("Signing service cert-info missing base64");
  }

  cachedKeyId = data.base64;
  cachedCertPem = base64ToPemCert(data.base64);

  return { keyId: cachedKeyId, certPem: cachedCertPem };
}

// Send canonical signing string to .NET microservice
// Returns Base64 signature + certificate keyId
async function signWithDotNet(signingString) {
  const baseUrl = process.env.SIGNING_SERVICE_URL || "http://localhost:5086";

  const res = await fetch(`${baseUrl}/sign`, {
    method: "POST",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: signingString,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Signing service failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data?.signature) {
    throw new Error("Signing service response missing signature");
  }

  const { keyId, certPem } = await loadCertInfoFromDotNet(baseUrl);
  return { signature: data.signature, keyId, certPem };
}

// Low-level HTTPS POST to Revenue
// Sends raw buffer to preserve byte integrity
function postToRosRaw({ url, headers, bodyBuffer }) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);

    const options = {
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port || 443,
      method: "POST",
      path: u.pathname + u.search,
      headers,
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (d) => chunks.push(d));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          status: res.statusCode ?? 0,
          ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
          headers: res.headers,
          text: buffer.toString("utf8"),
        });
      });
    });

    req.on("error", reject);

    // Logs raw response socket data (for deep debugging)
    req.on("socket", (socket) => {
      socket.on("data", (data) => {
        console.log("RAW SOCKET DATA SENT:", data.toString());
      });
    });

    req.end(bodyBuffer);
  });
}

// Build Revenue query string parameters
function buildQueryParams({ softwareUsed, softwareVersion, agentTain }) {
  const params = new URLSearchParams({
    softwareUsed,
    softwareVersion,
  });

  if (agentTain) {
    params.set("agentTain", agentTain);
  }

  return params.toString();
}

// ----------------------------------------------------
// Main ERR Submission Function
// ----------------------------------------------------
// Orchestrates complete signed submission to ROS
// ----------------------------------------------------
export async function submitErrToRos({
  employerRegistrationNumber,
  taxYear,
  runReference,
  submissionID,
  payload,
}) {
  // Determine ROS base URL (PIT or production)
  const rosBaseUrl = process.env.ROS_BASE_URL || "https://softwaretest.ros.ie";
  const rosHost = new URL(rosBaseUrl).host;

  // Software identifiers required by Revenue
  const softwareUsed =
    process.env.SOFTWARE_USED || "ERRExpenseManagementSystem";
  const softwareVersion = process.env.SOFTWARE_VERSION || "0.01.0.0001";
  const agentTain = process.env.AGENT_TAIN || "";

  // Construct Revenue endpoint path
  const path = `/paye-employers/v1/rest/enhanced_reporting/${encodeURIComponent(
    employerRegistrationNumber,
  )}/${encodeURIComponent(taxYear)}/${encodeURIComponent(
    runReference,
  )}/${encodeURIComponent(submissionID)}`;

  const queryString = buildQueryParams({
    softwareUsed,
    softwareVersion,
    agentTain,
  });

  const signedRequestTarget = `${path}?${queryString}`;
  const actualUrl = `${rosBaseUrl}${signedRequestTarget}`;

  // Serialise payload exactly as sent
  const requestBody = payload;
  const payloadBuffer = Buffer.from(JSON.stringify(requestBody), "utf8");

  const date = nowHttpDate();

  // Compute Digest header (bare Base64)
  const digest = computeDigestHeaderValue(payloadBuffer);

  // Debug canonical structure
  debugRosCanonical({
    method: "POST",
    requestTarget: signedRequestTarget,
    host: rosHost,
    date,
    payloadBuffer,
  });

  // Build canonical signing string
  const signingString = buildSigningString({
    method: "POST",
    requestTarget: signedRequestTarget,
    host: rosHost,
    date,
    digest,
  });

  // Obtain RSA signature from .NET service
  const { signature, keyId, certPem } = await signWithDotNet(signingString);

  // Local verification check (defensive validation)
  const verifiesLF = verifySignatureLocally({
    certPem,
    signingString,
    signatureBase64: signature,
  });

  console.log("\n===== SIGNATURE LOCAL VERIFY =====");
  console.log("Verifies against signing string? ", verifiesLF);
  console.log("==================================\n");

  // Construct HTTP Signature header
  const signatureHeader =
    `keyId="${keyId}",` +
    `algorithm="rsa-sha512",` +
    `headers="(request-target) host date digest",` +
    `signature="${signature}"`;

  const traceId = crypto.randomUUID();

  console.log("\n===== ROS REQUEST DEBUG =====");
  console.log("ACTUAL URL:", actualUrl);
  console.log("SIGNED (request-target):", `post ${signedRequestTarget}`);
  console.log("Host used in signature:", rosHost);
  console.log("Payload length:", payloadBuffer.length);
  console.log("Digest header:", digest);
  console.log("=============================\n");

  // Final request headers sent to Revenue
  const headers = {
    Host: rosHost,
    Date: date,
    Digest: digest,
    Signature: signatureHeader,
    "Content-Type": "application/json",
    Accept: "application/json",
    "Content-Length": payloadBuffer.length.toString(),
    "X-trace-id": traceId,
    "Accept-Encoding": "identity",
  };

  // Send signed request
  const rosRes = await postToRosRaw({
    url: actualUrl,
    headers,
    bodyBuffer: payloadBuffer,
  });

  // Attempt JSON parsing of response
  let json = null;
  try {
    json = JSON.parse(rosRes.text);
  } catch {
    // Non-JSON response
  }

  // Return structured diagnostic result
  return {
    ok: rosRes.ok,
    status: rosRes.status,
    response: json ?? rosRes.text,
    traceId,
    responseTraceId: rosRes.headers?.["x-trace-id"] ?? null,
    request: {
      url: actualUrl,
      signedRequestTarget,
      headers: {
        Host: rosHost,
        Date: date,
        Digest: digest,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Content-Length": payloadBuffer.length,
        "X-trace-id": traceId,
        Signature: signatureHeader,
      },
      signatureLocalVerify: { verifiesLF },
    },
  };
}
