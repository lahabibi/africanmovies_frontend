import { ensureDeviceId } from "../api/authToken";

export function getDevicePayload() {
  return {
    deviceId: ensureDeviceId(),
    deviceName: getDeviceName(),
    deviceType: getDeviceType(),
    os: getOperatingSystem(),
    platform: getPlatform(),
    userAgentName: getBrowserName(),
  };
}

function getDeviceName() {
  if (typeof navigator === "undefined") {
    return "Web Browser";
  }

  const browser = getBrowserName();
  const os = getOperatingSystem();

  return `${browser} on ${os}`;
}

function getDeviceType() {
  if (typeof navigator === "undefined") {
    return "Web";
  }

  if (/ipad|tablet/i.test(navigator.userAgent)) {
    return "Tablet";
  }

  if (/mobi|android|iphone/i.test(navigator.userAgent)) {
    return "Mobile";
  }

  return "Desktop";
}

function getOperatingSystem() {
  if (typeof navigator === "undefined") {
    return "Unknown";
  }

  const userAgent = navigator.userAgent;

  if (/windows/i.test(userAgent)) return "Windows";
  if (/mac os|macintosh/i.test(userAgent)) return "macOS";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/linux/i.test(userAgent)) return "Linux";

  return "Unknown";
}

function getPlatform() {
  if (typeof navigator === "undefined") {
    return "Web";
  }

  return navigator.platform || "Web";
}

function getBrowserName() {
  if (typeof navigator === "undefined") {
    return "Browser";
  }

  const userAgent = navigator.userAgent;

  if (/edg/i.test(userAgent)) return "Edge";
  if (/chrome|crios/i.test(userAgent)) return "Chrome";
  if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
    return "Safari";
  }
  if (/firefox|fxios/i.test(userAgent)) return "Firefox";

  return "Browser";
}
