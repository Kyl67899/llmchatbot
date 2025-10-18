// app/lib/settings.ts

export interface AppSettings {
  // Add other settings here if needed
}

export function getSettings(): AppSettings {
  return {}
}

export function saveSettings(_: AppSettings): void {
  // No-op
}
