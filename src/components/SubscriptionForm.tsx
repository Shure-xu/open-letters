"use client";

import { FormEvent, useRef, useState, useSyncExternalStore } from "react";
import { subscribeCopy } from "@/data/page-content";
import {
  EMAIL_PATTERN,
  SUBSCRIBER_STORAGE_KEY,
  maskEmail
} from "@/lib/subscription";

type SubscriptionFormProps = {
  formId: string;
  inputId: string;
  noteId: string;
  successId: string;
  addressId: string;
  defaultNote: string;
  successEnding: string;
};

type NoteState = "default" | "error" | "ok";

const SUBSCRIBER_CHANGE_EVENT = "openletters:subscriber-change";

function getSubscriberSnapshot() {
  if (typeof window === "undefined") return null;

  try {
    const saved = JSON.parse(
      localStorage.getItem(SUBSCRIBER_STORAGE_KEY) || "null"
    ) as { email?: string } | null;

    return saved?.email ?? null;
  } catch {
    return null;
  }
}

function getServerSubscriberSnapshot() {
  return null;
}

function subscribeToSubscriberStore(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SUBSCRIBER_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SUBSCRIBER_CHANGE_EVENT, onStoreChange);
  };
}

export function SubscriptionForm({
  formId,
  inputId,
  noteId,
  successId,
  addressId,
  defaultNote,
  successEnding
}: SubscriptionFormProps) {
  const [email, setEmail] = useState("");
  const [fallbackEmail, setFallbackEmail] = useState<string | null>(null);
  const [note, setNote] = useState(defaultNote);
  const [noteState, setNoteState] = useState<NoteState>("default");
  const inputRef = useRef<HTMLInputElement>(null);
  const storedEmail = useSyncExternalStore(
    subscribeToSubscriberStore,
    getSubscriberSnapshot,
    getServerSubscriberSnapshot
  );
  const subscribedEmail = storedEmail ?? fallbackEmail;
  const subscribed = Boolean(subscribedEmail);
  const maskedEmail = subscribedEmail ? maskEmail(subscribedEmail) : "你";

  function handleInputChange(value: string) {
    setEmail(value);
    setNote(defaultNote);
    setNoteState("default");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = email.trim();

    if (!value) {
      setNote(subscribeCopy.missingEmail);
      setNoteState("error");
      inputRef.current?.focus();
      return;
    }

    if (!EMAIL_PATTERN.test(value)) {
      setNote(subscribeCopy.invalidEmail);
      setNoteState("error");
      inputRef.current?.focus();
      return;
    }

    try {
      localStorage.setItem(
        SUBSCRIBER_STORAGE_KEY,
        JSON.stringify({ email: value, at: "subscribed" })
      );
      window.dispatchEvent(new Event(SUBSCRIBER_CHANGE_EVENT));
    } catch {
      // Keep success visible even when localStorage is unavailable.
    }

    setFallbackEmail(value);
    setNoteState("ok");
  }

  return (
    <>
      <form
        className="subscribe"
        id={formId}
        data-od-id={formId === "subscribe" ? "subscribe-form" : "subscribe-form-2"}
        noValidate
        onSubmit={handleSubmit}
        style={subscribed ? { display: "none" } : undefined}
      >
        <div className="sub-row">
          <input
            ref={inputRef}
            type="email"
            id={inputId}
            name="email"
            placeholder={subscribeCopy.placeholder}
            autoComplete="email"
            aria-label={subscribeCopy.ariaLabel}
            data-od-id={inputId === "email" ? "email-input" : "email-input-2"}
            value={email}
            onChange={(event) => handleInputChange(event.target.value)}
          />
          <button
            type="submit"
            data-od-id={
              inputId === "email" ? "subscribe-button" : "subscribe-button-2"
            }
          >
            {subscribeCopy.button}
          </button>
        </div>
        <p
          className={`sub-note${noteState === "error" ? " error" : ""}${
            noteState === "ok" ? " ok" : ""
          }`}
          id={noteId}
          data-od-id={
            noteId === "note" ? "subscribe-note" : "subscribe-note-2"
          }
        >
          {note}
        </p>
      </form>

      <div
        className={`sub-success${subscribed ? " show" : ""}`}
        id={successId}
        data-od-id={
          successId === "success" ? "subscribe-success" : "subscribe-success-2"
        }
      >
        <div className="check">✓</div>
        <h3>{subscribeCopy.successTitle}</h3>
        <p>
          我们已把{" "}
          <span className="addr" id={addressId}>
            {maskedEmail}
          </span>{" "}
          加入订阅名单。{successEnding}
        </p>
      </div>
    </>
  );
}
