import { API_BASE_URL } from "../config/env";
import { getAuthToken, getDeviceId } from "./authToken";
import {
  invalidateAuthSession,
  isInvalidSessionResponse,
} from "./authSession";
import { reportApiConnectionError } from "./connectivityEvents";

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
    monitorConnection = true,
    requireAuth = true,
    ...fetchOptions
  } = options;

  const requestHeaders = new Headers(headers);
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (body && !isFormData && !requestHeaders.has("Content-Type")) {
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

  let response;

  try {
    response = await fetch(buildApiUrl(endpoint), {
      ...fetchOptions,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      headers: requestHeaders,
      method,
    });
  } catch (error) {
    if (monitorConnection && error?.name !== "AbortError") {
      reportApiConnectionError();
    }

    throw error;
  }

  if (monitorConnection && response.status >= 500) {
    reportApiConnectionError();
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    if (requireAuth && isInvalidSessionResponse(response, data)) {
      invalidateAuthSession(data);
    }

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
