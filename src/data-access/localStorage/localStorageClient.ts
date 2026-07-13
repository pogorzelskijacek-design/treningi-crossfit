const NAMESPACE = 'crossfit-coach:v1';

export const STORAGE_KEYS = {
  workouts: `${NAMESPACE}:workouts`,
  generatedWorkouts: `${NAMESPACE}:generatedWorkouts`,
  profile: `${NAMESPACE}:profile`,
  prs: `${NAMESPACE}:prs`,
  readiness: `${NAMESPACE}:readiness`,
  knowledgeSources: `${NAMESPACE}:knowledgeSources`,
} as const;

export function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write localStorage key "${key}"`, err);
  }
}
