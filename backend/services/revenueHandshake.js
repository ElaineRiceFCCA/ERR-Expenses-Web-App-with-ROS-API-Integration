import https from "https";
import crypto from "crypto";

export async function performRevenueHandshake(company) {
  const method = "get";
  const host = "softwaretest.ros.ie";
  const basePath = "/paye-employers/v1/rest";

  const query = new URLSearchParams({
    softwareUsed: company.softwareUsed,
    softwareVersion: company.softwareVersion,
    employerRegistrationNumber: "8031508KH",
    agentTain: "88502T",
  }).toString();

  const pathAndQuery = `${basePath}/handshake?${query}`;
  const date = new Date().toUTCString();

  const signingString =
    `(request-target): ${method} ${pathAndQuery}\n` +
    `host: ${host}\n` +
    `date: ${date}`;

  const signResponse = await fetch("http://localhost:5086/sign", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: signingString,
  });

  const { signature } = await signResponse.json();

  const certInfo = await fetch("http://localhost:5086/cert-info");
  const certData = await certInfo.json();

  const signatureHeader =
    `keyId="${certData.base64}",` +
    `algorithm="rsa-sha512",` +
    `headers="(request-target) host date",` +
    `signature="${signature}"`;

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
      "X-trace-id": crypto.randomUUID(),
      Signature: signatureHeader,
    },
  };

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
