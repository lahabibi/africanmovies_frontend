import { useEffect, useRef } from "react";
import { getAuthToken, getDeviceId } from "../../api/authToken";
import { useCurrentUser, useEnrichCurrentDevice } from "../../hooks/useAuth";

const ENRICHED_DEVICE_PREFIX = "africanmovies.enrichedDevice";

function DeviceSessionEnricher() {
  const { data: currentUser } = useCurrentUser();
  const { mutate: enrichDevice } = useEnrichCurrentDevice();
  const activeAttemptRef = useRef(null);
  const userId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    const token = getAuthToken();
    const deviceId = getDeviceId();

    if (!token || !deviceId || !userId) {
      return undefined;
    }

    const enrichmentKey = `${ENRICHED_DEVICE_PREFIX}:${userId}:${deviceId}`;

    if (
      activeAttemptRef.current === enrichmentKey ||
      getSessionMarker(enrichmentKey)
    ) {
      return undefined;
    }

    activeAttemptRef.current = enrichmentKey;

    const runEnrichment = () => {
      enrichDevice(undefined, {
        onError: () => {
          activeAttemptRef.current = null;
        },
        onSuccess: () => {
          setSessionMarker(enrichmentKey);
          activeAttemptRef.current = null;
        },
      });
    };

    return scheduleWhenIdle(runEnrichment);
  }, [enrichDevice, userId]);

  return null;
}

function scheduleWhenIdle(callback) {
  if (typeof window.requestIdleCallback === "function") {
    const idleId = window.requestIdleCallback(callback, { timeout: 1500 });
    return () => window.cancelIdleCallback?.(idleId);
  }

  const timeoutId = window.setTimeout(callback, 400);
  return () => window.clearTimeout(timeoutId);
}

function getSessionMarker(key) {
  try {
    return window.sessionStorage.getItem(key) === "complete";
  } catch {
    return false;
  }
}

function setSessionMarker(key) {
  try {
    window.sessionStorage.setItem(key, "complete");
  } catch {
    // Enrichment still succeeds when session storage is unavailable.
  }
}

export default DeviceSessionEnricher;
