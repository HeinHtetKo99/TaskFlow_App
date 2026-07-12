const LOGIN_MESSAGES = {
  "auth/user-not-found": "No account found with this email. Please create an account first.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/invalid-login-credentials": "Incorrect email or password. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",
  "auth/too-many-requests": "Too many failed attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/missing-password": "Please enter your password.",
  "auth/missing-email": "Please enter your email address.",
};

const REGISTER_MESSAGES = {
  "auth/email-already-in-use": "An account with this email already exists. Please sign in instead.",
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/operation-not-allowed": "Email sign-up is not enabled. Contact support for help.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

export function validateEmail(email) {
  const value = (email || "").trim();
  if (!value) return "Please enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address.";
  return "";
}

export function validatePassword(password, { minLength = 6, forRegister = false } = {}) {
  const value = password || "";
  if (!value) return "Please enter your password.";
  if (forRegister && value.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }
  return "";
}

export function getLoginErrorMessage(error) {
  const code = error?.code || "";
  if (LOGIN_MESSAGES[code]) return LOGIN_MESSAGES[code];
  if (error?.message && !String(error.message).startsWith("Firebase:")) {
    return error.message;
  }
  return "Unable to sign in. Please try again.";
}

export function getRegisterErrorMessage(error) {
  const code = error?.code || "";
  if (REGISTER_MESSAGES[code]) return REGISTER_MESSAGES[code];
  return "Unable to create your account. Please try again.";
}
