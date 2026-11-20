"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny global store for the reservation dialog so any CTA (header, footer)
 * can open it without prop drilling or a context provider.
 */
let open = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function openReservation() {
  if (open) return;
  open = true;
  emit();
}

export function closeReservation() {
  if (!open) return;
  open = false;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useReservationOpen() {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
}
