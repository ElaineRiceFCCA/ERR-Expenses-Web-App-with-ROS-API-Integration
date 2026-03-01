import https from "https";
import crypto from "crypto";

// ----------------------------------------------------
// performRevenueHandshake(company)
// Performs ROS PIT3 REST handshake using HTTP Signature
// Delegates RSA-SHA512 signing to local .NET microservice
// ----------------------------------------------------
export async function performRevenueHandshake(company) {
  const method = "get";
  const host = "softwaretest.ros.ie";
  const basePath = "/paye-employers/v1/rest";

  // Build Revenue-required query parameters
  const query = new URLSearchParams({
    softwareUsed: company.softwareUsed,
    softwareVersion: company.softwareVersion,
    employerRegistrationNumber: "8031508KH", // POC hardcoded
    agentTain: "88502T", // POC hardcoded
  }).toString();

  const pathAndQuery = `${basePath}/handshake?${query}`;
  const date = new Date().toUTCString();

  // Construct HTTP Signature signing string (per Revenue spec)
  const signingString =
    `(request-target): ${method} ${pathAndQuery}\n` +
    `host: ${host}\n` +
    `date: ${date}`;

  // Delegate signing to local .NET signing microservice
  const signResponse = await fetch("http://localhost:5086/sign", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: signingString,
  });

  const { signature } = await signResponse.json();

  // Retrieve base64-encoded certificate identifier (keyId)
  const certInfo = await fetch("http://localhost:5086/cert-info");
  const certData = await certInfo.json();

  // Build Signature header (HTTP Signature scheme)
  const signatureHeader =
    `keyId="${certData.base64}",` +
    `algorithm="rsa-sha512",` +
    `headers="(request-target) host date",` +
    `signature="${signature}"`;

  // HTTPS request options (manual header control required)
  const options = {
    hostname: host,
    path: pathAndQuery,
    method: "get",
    setDefaultHeaders: false,
    headers: {
      Host: host,
      Date: date,
      Accept: "application/json",
      "Cache-Control": "no-cache",
      "X-trace-id": crypto.randomUUID(), // Correlation identifier
      Signature: signatureHeader,
    },
  };

  // Execute handshake request to ROS
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          body: data,
        });
      });
    });

    req.on("error", reject);
    req.end();
  });
}
