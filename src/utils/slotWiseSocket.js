import io from "socket.io-client";
import config from "../config";

export function createSlotWiseSocket() {
  return io(config.API_URL, {
    transports: ["websocket"],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
  });
}

export function buildSlotWiseQueryKey(query) {
  try {
    return JSON.stringify(query || {});
  } catch {
    return String(Date.now());
  }
}

