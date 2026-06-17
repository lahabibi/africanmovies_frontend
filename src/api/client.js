import { API_BASE_URL } from "../config/env";
import { getAuthToken, getDeviceId } from "./authToken";

export class ApiError extends Error {
  constructor(message, { data, status } = {}) {
    super(message);
    this.name = "ApiError";
    this.data = data;
    this.status = status;
  }
}

export async function apiClient(endpoint, options = {}) {
  const {
    body,
    headers,
    method = body ? "POST" : "GET",
    requireAuth = true,
    ...fetchOptions
  } = options;

  const requestHeaders = new Headers(headers);

  if (body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  const deviceId = getDeviceId();

  if (requireAuth && token && !requestHeaders.has("x-auth-token")) {
    requestHeaders.set("x-auth-token", token);
  }

  if (requireAuth && deviceId && !requestHeaders.has("x-device-id")) {
    requestHeaders.set("x-device-id", deviceId);
  }

  const response = await fetch(buildApiUrl(endpoint), {
    ...fetchOptions,
    body: body ? JSON.stringify(body) : undefined,
    headers: requestHeaders,
    method,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, response), {
      data,
      status: response.status,
    });
  }

  return data;
}

function buildApiUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  return `${API_BASE_URL}${normalizedEndpoint}`;
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getErrorMessage(data, response) {
  if (data && typeof data === "object") {
    return data.message || data.error || response.statusText;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return response.statusText || "Request failed";
}
