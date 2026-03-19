const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/;
const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 10 characters and include uppercase, lowercase, number, and special character.";

function isStrongPassword(password) {
  return typeof password === "string" && PASSWORD_POLICY_REGEX.test(password);
}

function assertStrongPassword(password) {
  if (!isStrongPassword(password)) {
    const error = new Error(PASSWORD_POLICY_MESSAGE);
    error.status = 400;
    throw error;
  }
}

module.exports = {
  PASSWORD_POLICY_REGEX,
  PASSWORD_POLICY_MESSAGE,
  isStrongPassword,
  assertStrongPassword,
};