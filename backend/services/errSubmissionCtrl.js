export async function generateERRSubmission(payDate) {
  if (!payDate) throw new Error("payDate required");

  return {
    message: "Test Submission",
    payDate,
  };
}
