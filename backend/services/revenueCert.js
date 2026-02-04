import fs from "fs";
import crypto from "crypto";

export default class RevenueCert {
  constructor(privateKey, keyIdBase64) {
    this.privateKey = privateKey;
    this.keyIdBase64 = keyIdBase64;
  }

  static loadFromPem(pemPath) {
    try {
      const pem = fs.readFileSync(pemPath, "utf8");

      // Load private key
      const privateKey = crypto.createPrivateKey(pem);

      // Extract public key for keyId
      const publicKey = crypto.createPublicKey(privateKey);
      const publicDer = publicKey.export({ format: "der", type: "spki" });

      const keyIdBase64 = Buffer.from(publicDer).toString("base64");

      return new RevenueCert(privateKey, keyIdBase64);
    } catch (err) {
      throw new Error(`Failed to load Revenue certificate: ${err.message}`);
    }
  }

  signString(signingString) {
    const signature = crypto.sign(
      "RSA-SHA512",
      Buffer.from(signingString),
      this.privateKey,
    );
    return signature.toString("base64");
  }

  static hashPayload(payload) {
    return crypto.createHash("sha512").update(payload).digest("base64");
  }
}
