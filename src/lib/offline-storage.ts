"use client"

export function getLocalItems<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setLocalItems<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    // localStorage full or unavailable
  }
}

export function addLocalItem<T>(key: string, item: T) {
  const items = getLocalItems<T>(key)
  items.unshift(item)
  setLocalItems(key, items)
}

export function updateLocalItem<T extends { id: string }>(key: string, id: string, updater: (item: T) => T) {
  const items = getLocalItems<T>(key)
  const updated = items.map((item) => (item as T & { id: string }).id === id ? updater(item) : item)
  setLocalItems(key, updated)
}

export function generateId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
