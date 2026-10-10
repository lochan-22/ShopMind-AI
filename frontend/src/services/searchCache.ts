/**
 * ShopMind AI — Search Decision Cache
 *
 * Preserves live SerpApi search results, AI shopping analysis, and Top 5 recommendations
 * across navigation to product details and back.
 *
 * Implements:
 * - In-memory fast cache with sessionStorage fallback
 * - Scroll position preservation
 * - Query-normalized indexing
 * - Automatic expiration (30-minute TTL)
 * - Safe error handling (never stores credentials or sensitive data)
 */

import type { ShoppingDecision } from "./productService";

export interface CachedSearchEntry {
  decision: ShoppingDecision;
  timestamp: number;
  scrollY?: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const memoryCache = new Map<string, CachedSearchEntry>();
const SESSION_PREFIX = "shopmind_search_cache_";

function normalizeKey(query: string): string {
  return query.trim().toLowerCase();
}

function readFromSession(normalizedKey: string): CachedSearchEntry | null {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + normalizedKey);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CachedSearchEntry;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(SESSION_PREFIX + normalizedKey);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function writeToSession(normalizedKey: string, entry: CachedSearchEntry): void {
  try {
    sessionStorage.setItem(SESSION_PREFIX + normalizedKey, JSON.stringify(entry));
  } catch {
    // sessionStorage quota exceeded or disabled, memory cache handles it
  }
}

export function getSearchEntry(query: string): CachedSearchEntry | null {
  if (!query || !query.trim()) return null;
  const key = normalizeKey(query);

  // 1. Check memory cache first
  const memoryEntry = memoryCache.get(key);
  if (memoryEntry) {
    if (Date.now() - memoryEntry.timestamp <= CACHE_TTL_MS) {
      return memoryEntry;
    }
    memoryCache.delete(key);
  }

  // 2. Check session storage
  const sessionEntry = readFromSession(key);
  if (sessionEntry) {
    memoryCache.set(key, sessionEntry);
    return sessionEntry;
  }

  return null;
}

export function setSearchDecision(
  query: string,
  decision: ShoppingDecision,
  scrollY?: number,
): void {
  if (!query || !query.trim() || !decision) return;
  const key = normalizeKey(query);
  const entry: CachedSearchEntry = {
    decision,
    timestamp: Date.now(),
    scrollY: scrollY != null ? scrollY : 0,
  };

  memoryCache.set(key, entry);
  writeToSession(key, entry);
}

export function updateScrollY(query: string, scrollY: number): void {
  if (!query || !query.trim()) return;
  const key = normalizeKey(query);
  const existing = getSearchEntry(query);
  if (existing) {
    existing.scrollY = scrollY;
    memoryCache.set(key, existing);
    writeToSession(key, existing);
  }
}

export function invalidateSearchDecision(query: string): void {
  if (!query || !query.trim()) return;
  const key = normalizeKey(query);
  memoryCache.delete(key);
  try {
    sessionStorage.removeItem(SESSION_PREFIX + key);
  } catch {
    // Ignore storage errors
  }
}

export function hasValidSearchDecision(query: string): boolean {
  return getSearchEntry(query) !== null;
}

