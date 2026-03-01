import fs from "fs";
import path from "path";
import Company from "../models/Company.js";
import Claim from "../models/Claim.js";
import "../models/Employee.js";
import "../models/Element.js";

// ----------------------------------------------------
// generateERRSubmission(payDate)
// Builds a Revenue-compliant ERR submission payload
// for a specific payDate
// ----------------------------------------------------
export async function generateERRSubmission(payDate) {
  // 1. Load active company configuration
  const company = await Company.findOne({ active: true });
  if (!company) throw new Error("No active company found");

  // 2. Load claims within the specified UTC day range
  const start = new Date(payDate);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(payDate);
  end.setUTCHours(23, 59, 59, 999);

  const claims = await Claim.find({
    payDate: { $gte: start, $lte: end },
  })
    .populate("employee") // Required for PPSN branching
    .populate("element") // Required for category mapping
    .sort({ employee: 1, createdAt: 1 });

  if (!claims.length) {
    throw new Error("No claims found for payDate");
  }

  // 3. Construct Revenue run references
  const dateObj = new Date(payDate);

  const yyyyMM = dateObj.toISOString().slice(0, 7).replace("-", "");

  const runSequence = "1N"; // POC: always first normal run (hardcoded)

  const enhancedReportingRunReference = `${company.payrollReference}-${yyyyMM}${runSequence}`;

  const submissionID = `${enhancedReportingRunReference}-ER1`;

  // 4. Build expensesBenefits line items
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
      amount: Number(claim.amount.toFixed(2)),
    };

    // Optional subCategory
    if (celms.subCategory) {
      lineItem.subCategory = celms.subCategory;
    }

    // Category-specific rule: remote working requires numberOfDays
    if (celms.category === "REMOTE_WORKING_DAILY_ALLOWANCE") {
      if (!claim.days) {
        throw new Error("Remote working claim missing number of days");
      }
      lineItem.numberOfDays = claim.days;
    }

    // Employee identification branching:
    // PPSN-known vs PPSN-unknown structure
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

  // 5. Assemble submission object
  const submission = {
    enhancedReportingRunReference,
    submissionID,
    body: {
      expensesBenefits,
    },
  };

  // 6. Persist JSON export
  const exportDir = path.resolve("exports");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const filePath = path.join(exportDir, `${submissionID}.json`);
  fs.writeFileSync(filePath, JSON.stringify(submission, null, 2));

  return submission;
}
