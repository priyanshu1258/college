// Support either VITE_API_URL or VITE_BACKEND_URL for legacy compatibility.
const RAW_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

// Normalize base and avoid double slashes when joining with path
const BASE_URL = RAW_BASE.replace(/\/+$|\/$/g, "");

export async function apiRequest(
  path,
  { method = "GET", body, headers = {} } = {}
) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = `${BASE_URL}/${cleanPath}`;

  const res = await fetch(url, {
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
