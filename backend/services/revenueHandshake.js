import crypto from "crypto";
import RevenueCert from "./revenueCert.js";

export async function performRevenueHandshake(company) {
  const cert = RevenueCert.loadFromPem(company.rosCertPath);

  const query = new URLSearchParams({
    softwareUsed: "ERRExpenseManagementSystem",
    softwareVersion: "0.01.0.0001",
    employerReg: company.employerRegistrationNumber,
    ...(company.agentTain && { agentTAIN: company.agentTain }),
  }).toString();

  const method = "GET";
  const host = "softwaretest.ros.ie";
  const pathAndQuery = `/paye-employers/v1/rest/handshake?${query}`;
  const date = new Date().toUTCString();

  const signingString =
    `(request-target): ${method} ${pathAndQuery}\n` +
    `host: ${host}\n` +
    `date: ${date}`;

  const signature = cert.signString(signingString);

  const signatureHeader =
    `keyId="${cert.certBase64}",` +
    `algorithm="rsa-sha512",` +
    `headers="(request-target) host date",` +
    `signature="${signature}"`;

  const response = await fetch(`https://${host}${pathAndQuery}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
      "X-trace-id": crypto.randomUUID(),
      Host: host,
      Date: date,
      Signature: signatureHeader,
    },
  });

  return {
    status: response.status,
    body: await response.text(),
  };
}
