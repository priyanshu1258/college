import { apiRequest } from "./client";

export function register(payload) {
  return apiRequest("/api/register", { method: "POST", body: payload });
}