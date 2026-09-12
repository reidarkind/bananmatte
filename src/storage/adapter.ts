export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function memoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = value;
    },
  };
}

export function browserStore(): KeyValueStore {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage;
    }
  } catch {
    // private mode or missing storage
  }
  return memoryStore();
}
