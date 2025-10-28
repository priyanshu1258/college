const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiRequest(
  path,
  { method = "GET", body, headers = {} } = {}
) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : {};
  if (!res.ok || data?.success === false)
    throw new Error(data?.error || `Request failed: ${res.status}`);
  return data;
}