"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { closeReservation, useReservationOpen } from "@/lib/reservation";

type Status = "idle" | "error" | "confirmed";

/** Deterministic pseudo-serial so the confirmation reads like a real allocation. */
function serialFor(email: string) {
  let h = 2166136261;
  for (let i = 0; i < email.length; i++) {
    h ^= email.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return String((h >>> 0) % 500 + 1).padStart(3, "0");
}

export default function ReservationModal() {
  const isOpen = useReservationOpen();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");
  const titleId = useId();
  const errorId = useId();

  // Sync the store with the native <dialog> (gives focus trap, Esc and inert background for free).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    closeReservation();
    // Reset after the panel is gone so the confirmation doesn't flash away mid-close.
    setTimeout(() => {
      setStatus("idle");
      setEmail("");
    }, 200);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    setStatus(valid ? "confirmed" : "error");
    if (!valid) inputRef.current?.focus();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleClose}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes.
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="reserve-dialog m-0 mt-auto max-h-[90dvh] w-full max-w-none border-t border-white/15 bg-[#0F161A] p-0 text-ink sm:m-auto sm:max-w-lg sm:border"
    >
      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <p className="font-mono text-[10px] tracking-[0.24em] text-ink-muted">
            BATCH 01 // ALLOCATION FORM
          </p>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close reservation form"
            className="-m-2 p-2 text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink"
          >
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>

        <h2 id={titleId} className="mt-5 font-display text-2xl font-bold leading-tight sm:text-3xl">
          {status === "confirmed" ? "SLOT HELD." : "RESERVE K-01 UNIT"}
        </h2>

        {status === "confirmed" ? (
          <div className="mt-6" role="status">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-white/15 py-4 font-mono text-[11px] tracking-[0.14em]">
              <dt className="text-ink-muted">SERIAL</dt>
              <dd className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-cta" aria-hidden="true" />
                K01-B01-{serialFor(email.trim().toLowerCase())} / 500
              </dd>
              <dt className="text-ink-muted">CONTACT</dt>
              <dd className="break-all">{email.trim().toUpperCase()}</dd>
              <dt className="text-ink-muted">STATUS</dt>
              <dd>PENDING DEPOSIT // SHIPS Q1</dd>
            </dl>
            <p className="mt-4 font-mono text-xs leading-relaxed text-ink-muted">
              Your place in Batch 01 is held. Deposit instructions go out to this address before the run opens.
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="mt-6 w-full border border-white/25 px-5 py-3 font-mono text-[11px] tracking-[0.2em] transition-colors hover:border-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              RETURN TO BLUEPRINT
            </button>
          </div>
        ) : (
          <form className="mt-6" onSubmit={submit} noValidate>
            <p className="font-mono text-xs leading-relaxed text-ink-muted">
              Limited run of 500 serialized units. No payment now: we hold a serial against your address.
            </p>
            <label className="mt-6 block font-mono text-[10px] tracking-[0.24em] text-ink-muted" htmlFor="reserve-email">
              CONTACT EMAIL
            </label>
            <input
              ref={inputRef}
              id="reserve-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              aria-invalid={status === "error"}
              aria-describedby={status === "error" ? errorId : undefined}
              placeholder="you@studio.com"
              className={`mt-2 w-full border bg-mat px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none ${
                status === "error" ? "border-cta" : "border-white/20 focus:border-ink"
              }`}
            />
            <p id={errorId} className="mt-2 min-h-4 font-mono text-[10px] tracking-[0.16em] text-cta" aria-live="polite">
              {status === "error" ? "INVALID ADDRESS // CHECK FORMAT" : ""}
            </p>
            <button
              type="submit"
              className="group mt-4 flex w-full items-center justify-between border border-cta bg-cta px-5 py-3 font-mono text-[11px] font-semibold tracking-[0.2em] text-mat transition-colors duration-200 hover:bg-transparent hover:text-cta focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-cta"
            >
              <span>CONFIRM ALLOCATION</span>
              <svg className="h-2.5 w-3 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                <path d="M0 5h11M7 1l4 4-4 4" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
