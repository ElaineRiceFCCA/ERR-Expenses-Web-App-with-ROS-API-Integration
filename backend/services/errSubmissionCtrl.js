import Company from "../models/Company.js";
import Claim from "../models/Claim.js";

export async function generateERRSubmission(payDate) {
  // Load company details
  const company = await Company.findOne({ active: true });
  if (!company) throw new Error("No active company found");

  // 2. Load pending claims for payDate
  const claims = await Claim.find({ payDate })
    .populate("employee")
    .populate("element")
    .sort({ employee: 1, createdAt: 1 });

  if (!claims.length) {
    throw new Error("No claims found for payDate");
  }

  return {
    employerRegistrationNumber: company.employerRegistrationNumber,
    taxYear: company.taxYear,
  };
}
