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

  // 3. Compile run references
  const yyyyMM = payDate.toISOString().slice(0, 7).replace("-", "");
  const runSequence = "1N";

  const enhancedReportingRunReference = `${company.payrollReference}-${yyyyMM}${runSequence}`;

  const submissionID = `${enhancedReportingRunReference}-ER1`;

  return {
    employerRegistrationNumber: company.employerRegistrationNumber,
    taxYear: company.taxYear,
    claimCount: claims.length,
    enhancedReportingRunReference,
    submissionID,
  };
}
