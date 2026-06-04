import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "https://staynest-cr08.onrender.com";
export const AUTH_TOKEN_KEY = "staynest-auth-token";

export function saveAuthToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      window.dispatchEvent(new CustomEvent("staynest-auth-change", {
        detail: { user: null },
      }));
    }

    return Promise.reject(error);
  }
);
