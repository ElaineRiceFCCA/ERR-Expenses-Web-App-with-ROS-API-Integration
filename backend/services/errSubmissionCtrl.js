import fs from "fs";
import path from "path";
import Company from "../models/Company.js";
import Claim from "../models/Claim.js";

/* ----------------------------------------------------
Helpers
----------------------------------------------------*/

function getPayPeriod(payDate) {
  return payDate.toISOString().slice(0, 7).replace("-", "");
}

function generateIdentifiers(company, payDate) {
  const yyyyMM = getPayPeriod(payDate);
  const runSequence = "1N";

  const enhancedReportingRunReference = `${company.payrollReference}-${yyyyMM}${runSequence}`;

  const submissionID = `${enhancedReportingRunReference}-ER1`;

  return { enhancedReportingRunReference, submissionID };
}

function buildEmployeeIdentity(employee) {
  if (employee.employeePpsn && employee.employmentID) {
    return {
      employeeID: {
        employmentID: employee.employmentID,
        employeePpsn: employee.employeePpsn,
      },
      name: {
        firstName: employee.firstName,
        familyName: employee.familyName,
      },
    };
  }

  return {
    employeeID: {
      employerReference: employee.employerReference,
    },
    name: {
      firstName: employee.firstName,
      familyName: employee.familyName,
    },
    address: employee.address,
    dateOfBirth: employee.dateOfBirth
      ? employee.dateOfBirth.toISOString().slice(0, 10)
      : undefined,
  };
}

function buildLineItem(claim, submissionID, index) {
  const employee = claim.employee;
  const element = claim.element;

  const lineItem = {
    lineItemID: `${submissionID}-${index + 1}`,
    category: element.category,
    paymentDate: claim.payDate.toISOString().slice(0, 10),
    amount: Number(claim.amount.toFixed(2)),
  };

  if (element.subCategory) {
    lineItem.subCategory = element.subCategory;
  }

  if (element.category === "REMOTE_WORKING_DAILY_ALLOWANCE") {
    lineItem.numberOfDays = claim.days || 1;
  }

  Object.assign(lineItem, buildEmployeeIdentity(employee));

  return lineItem;
}

function exportSubmissionFile(submissionID, submission) {
  const exportDir = path.resolve("exports");

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const filePath = path.join(exportDir, `${submissionID}.json`);

  fs.writeFileSync(filePath, JSON.stringify(submission, null, 2));

  return filePath;
}

/* ----------------------------------------------------
MAIN FUNCTION
----------------------------------------------------*/

export async function generateERRSubmission(payDateInput) {
  // ------------------------------
  // Load active company configuration
  // ------------------------------
  const company = await Company.findOne({ active: true });
  if (!company) {
    throw new Error("No active company configuration found");
  }

  const payDate = new Date(payDateInput);

  // ------------------------------
  // Load claims within the specified UTC day range
  // ------------------------------
  const start = new Date(payDate);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(payDate);
  end.setUTCHours(23, 59, 59, 999);

  const claims = await Claim.find({
    payDate: { $gte: start, $lte: end },
    status: "pending",
  })
    .populate("employee") // Required for PPSN branching
    .populate("element") // Required for category mapping
    .sort({ employee: 1, createdAt: 1 });

  if (!claims.length) {
    throw new Error("No pending claims found for selected payDate");
  }

  // ------------------------------
  // Generate Revenue identifiers
  // ------------------------------
  const { enhancedReportingRunReference, submissionID } = generateIdentifiers(
    company,
    payDate,
  );

  // ------------------------------
  // Build expensesBenefits line items
  // ------------------------------
  const expensesBenefits = claims.map((claim, index) =>
    buildLineItem(claim, submissionID, index),
  );

  // ------------------------------
  // Assemble submission object
  // ------------------------------
  const submission = {
    employerRegistrationNumber: company.employerRegistrationNumber,
    taxYear: company.taxYear,
    enhancedReportingRunReference,
    submissionID,
    requestBody: {
      expensesBenefits,
    },
  };

  // ------------------------------
  // Export JSON file (manual filing requirement)
  // ------------------------------
  const filePath = exportSubmissionFile(submissionID, submission);

  return {
    submission,
    filePath,
    claims,
  };
}
