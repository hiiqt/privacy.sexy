// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * useChecklistPersistence — persists the checked script IDs to localStorage,
 * keyed per operating-system so Android and GrapheneOS checklists are independent.
 *
 * Storage key format:  privacy-checklist-<osKey>
 * Storage value:       JSON array of ExecutableId strings
 */
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import type { OperatingSystem } from '@/domain/OperatingSystem';

const STORAGE_PREFIX = 'privacy-checklist-';

function storageKey(os: OperatingSystem): string {
  return `${STORAGE_PREFIX}${os}`;
}

/** Returns the set of IDs saved for a given OS. */
export function loadPersistedIds(os: OperatingSystem): Set<ExecutableId> {
  try {
    const raw = localStorage.getItem(storageKey(os));
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed as ExecutableId[]);
  } catch {
    return new Set();
  }
}

/** Persists the current set of checked IDs for an OS. */
export function persistIds(os: OperatingSystem, ids: ReadonlySet<ExecutableId>): void {
  try {
    localStorage.setItem(storageKey(os), JSON.stringify([...ids]));
  } catch {
    // localStorage may be unavailable (private browsing quota exceeded, etc.) — fail silently.
  }
}
