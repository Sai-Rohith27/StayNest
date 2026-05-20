import { toast } from "react-toastify";

export const LOGIN_REQUIRED_MESSAGE = "Please login first.";
export const CREATE_LISTING_LOGIN_MESSAGE = "You must login to create listing.";

export function isLoginRequiredError(err) {
  const errorMessage = String(err?.response?.data?.error || "").toLowerCase();

  return err?.response?.status === 401 || errorMessage.includes("login");
}

export function showLoginRequired(navigate, message = LOGIN_REQUIRED_MESSAGE) {
  toast.error(message);
  navigate("/login");
}
