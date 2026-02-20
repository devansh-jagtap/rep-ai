interface FailureState {
  consecutiveFailures: number;
  windowStartedAt: number;
  blockedUntil: number;
}

const failureByHandle = new Map<string, FailureState>();
const FAILURE_WINDOW_MS = 60_000;
const BLOCK_DURATION_MS = 5 * 60_000;
const FAILURE_THRESHOLD = 5;

function getState(handle: string, now: number): FailureState {
  const state = failureByHandle.get(handle);
  if (!state) {
    const initial: FailureState = {
      consecutiveFailures: 0,
      windowStartedAt: now,
      blockedUntil: 0,
    };
    failureByHandle.set(handle, initial);
    return initial;
  }

  if (state.windowStartedAt + FAILURE_WINDOW_MS < now) {
    state.windowStartedAt = now;
    state.consecutiveFailures = 0;
  }

  return state;
}

export function isHandleTemporarilyBlocked(handle: string): boolean {
  const now = Date.now();
  const state = getState(handle, now);
  return state.blockedUntil > now;
}

export function markHandleAiFailure(handle: string): void {
  const now = Date.now();
  const state = getState(handle, now);

  if (state.blockedUntil > now) {
    return;
  }

  state.consecutiveFailures += 1;

  if (state.consecutiveFailures >= FAILURE_THRESHOLD) {
    state.blockedUntil = now + BLOCK_DURATION_MS;
    state.consecutiveFailures = 0;
    state.windowStartedAt = now;
  }
}

export function markHandleAiSuccess(handle: string): void {
  const now = Date.now();
  const state = getState(handle, now);
  state.consecutiveFailures = 0;
  state.windowStartedAt = now;
}
