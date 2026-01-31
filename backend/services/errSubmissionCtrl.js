import fs from "fs";
import path from "path";
import Company from "../models/Company.js";
import Claim from "../models/Claim.js";
import "../models/Employee.js";
import "../models/Element.js";

// Generate submission for a single payDate
export async function generateERRSubmission(payDate) {
  // 1. Load company details
  const company = await Company.findOne({ active: true });
  if (!company) throw new Error("No active company found");

  // 2. Load pending claims for payDate
  const start = new Date(payDate);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(payDate);
  end.setUTCHours(23, 59, 59, 999);

  const claims = await Claim.find({
    payDate: { $gte: start, $lte: end },
  })
    .populate("employee")
    .populate("element")
    .sort({ employee: 1, createdAt: 1 });

  if (!claims.length) {
    throw new Error("No claims found for payDate");
  }

  // 3. Compile run references
  const dateObj = new Date(payDate);

  const yyyyMM = dateObj.toISOString().slice(0, 7).replace("-", "");

  const runSequence = "1N"; // POC: always first normal run (hardcoded)

  const enhancedReportingRunReference = `${company.payrollReference}-${yyyyMM}${runSequence}`;

  const submissionID = `${enhancedReportingRunReference}-ER1`;

  // 4. Build line items
  const expensesBenefits = claims.map((claim, index) => {
    if (!claim.employee || !claim.element) {
      throw new Error("Claim missing employee or element reference");
    }

    const empl = claim.employee;
    const celms = claim.element;

    const lineItem = {
      lineItemID: `${submissionID}-${index + 1}`,
      category: celms.category,
      paymentDate: claim.payDate.toISOString().slice(0, 10),
      amount: claim.amount.toFixed(2),
    };

    if (celms.subCategory) {
      lineItem.subCategory = celms.subCategory;
    }

    // Employee identification
    if (empl.employeePpsn && empl.employmentID) {
      lineItem.employeeID = {
        employmentID: empl.employmentID,
        employeePpsn: empl.employeePpsn,
      };
      lineItem.name = {
        firstName: empl.firstName,
        familyName: empl.familyName,
      };
    } else {
      lineItem.employeeID = {
        employerReference: empl.employerReference,
      };
      lineItem.name = {
        firstName: empl.firstName,
        familyName: empl.familyName,
      };
      lineItem.address = empl.address;
      lineItem.dateOfBirth = empl.dateOfBirth?.toISOString().slice(0, 10);
    }

    return lineItem;
  });

  // 5. Assemble final submission
  const submission = {
    enhancedReportingRunReference,
    submissionID,
    requestBody: {
      requestType: "EnhancedReportingSubmission",
      employerRegistrationNumber: company.employerRegistrationNumber,
      taxYear: company.taxYear,
      softwareUsed: company.softwareUsed,
      softwareVersion: company.softwareVersion,
      expensesBenefits,
    },
  };

  // 6. Write JSON to disk
  const exportDir = path.resolve("exports");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const filePath = path.join(exportDir, `${submissionID}.json`);
  fs.writeFileSync(filePath, JSON.stringify(submission, null, 2));

  return submission;
}
