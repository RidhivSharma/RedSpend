const AUTH_ERROR_MESSAGES = {
  "auth/invalid-email": "That email address doesn't look valid.",
  "auth/missing-email": "Please enter your email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",
  "auth/user-not-found": "No account found with that email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in instead.",
  "auth/weak-password": "Your password is too weak. Use at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/cancelled-popup-request": "Google sign-in was cancelled.",
  "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups and try again.",
  "auth/unauthorized-domain": "Google sign-in isn't available on this domain yet.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled for the project.",
  "auth/internal-error": "Something went wrong on our side. Please try again.",
};

export function getAuthErrorMessage(error) {
  if (error?.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  return "Something went wrong. Please try again.";
}
