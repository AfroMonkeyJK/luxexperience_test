/**
 * UI Constants - ONLY for user-facing text, labels, and attributes
 * Technical selectors and IDs should go in selectors.js
 */

export const buttons = {};

export const attributes = {
  dataDisabled: "data-disabled",
  input: "input",
  name: "name",
  id: "id",
  role: "role",
  placeholder: "placeholder",
  ariaLabel: "aria-label",
  password: "password",
  type: "type",
};

export const inputAttributes = {
  submitType: { attribute: "type", value: "submit" },
  signInValue: { attribute: "value", value: "Sign in" },
};

export const testStatus = {
  passed: "PASSED",
  failed: "FAILED",
  skipped: "SKIPPED",
  pending: "PENDING",
  undefined: "UNDEFINED",
  ambiguous: "AMBIGUOUS",
};

export const testHelpers = {
  isTestFailure: (status) => status === testStatus.failed,
  isTestSuccess: (status) => status === testStatus.passed,
  isTestSkipped: (status) =>
    [testStatus.skipped, testStatus.pending, testStatus.undefined].includes(
      status
    ),
};

export const uiConstants = {
  buttons,
  attributes,
  inputAttributes,
  testStatus,
  testHelpers,
};

export default uiConstants;
