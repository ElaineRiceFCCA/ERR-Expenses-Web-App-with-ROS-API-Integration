import Company from "../models/Company.js";

export async function generateERRSubmission(payDate) {
  // Load company details
  const company = await Company.findOne({ active: true });
  if (!company) throw new Error("No active company found");

  return {
    employerRegistrationNumber: company.employerRegistrationNumber,
    taxYear: company.taxYear,
  };
}
