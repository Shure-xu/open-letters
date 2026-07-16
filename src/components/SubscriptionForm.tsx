"use client";

import { FormEvent, useRef, useState, useSyncExternalStore } from "react";
import { subscribeCopy } from "@/data/page-content";
import { EMAIL_PATTERN, maskEmail } from "@/lib/subscription";

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

type WelcomeEmailStatus = "sent" | "already-sent" | "failed";

type SubscriberSnapshot = {
  email: string;
  welcomeEmail: WelcomeEmailStatus;
};

let subscribedEmailSnapshot: SubscriberSnapshot | null = null;
const subscriberListeners = new Set<() => void>();

function getSubscriberSnapshot() {
  return subscribedEmailSnapshot;
}

function getServerSubscriberSnapshot() {
  return null;
}

function subscribeToSubscriberStore(onStoreChange: () => void) {
  subscriberListeners.add(onStoreChange);

  return () => {
    subscriberListeners.delete(onStoreChange);
  };
}

function setSubscribedEmailSnapshot(snapshot: SubscriberSnapshot) {
  subscribedEmailSnapshot = snapshot;
  subscriberListeners.forEach((listener) => listener());
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
  const [note, setNote] = useState(defaultNote);
  const [noteState, setNoteState] = useState<NoteState>("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const storedEmail = useSyncExternalStore(
    subscribeToSubscriberStore,
    getSubscriberSnapshot,
    getServerSubscriberSnapshot
  );
  const subscribedEmail = storedEmail?.email;
  const subscribed = Boolean(storedEmail);
  const maskedEmail = subscribedEmail ? maskEmail(subscribedEmail) : "你";
  const resolvedSuccessEnding =
    storedEmail?.welcomeEmail === "failed"
      ? "订阅已经生效。欢迎邮件暂时延迟,我们会尽快处理。"
      : successEnding;

  function handleInputChange(value: string) {
    setEmail(value);
    setNote(defaultNote);
    setNoteState("default");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    setIsSubmitting(true);
    setNote(subscribeCopy.submitting);
    setNoteState("default");

    let welcomeEmail: WelcomeEmailStatus = "failed";

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: value,
          source: formId === "subscribe" ? "hero" : "cta"
        })
      });

      if (!response.ok) {
        let message = subscribeCopy.subscribeFailed;

        try {
          const result = (await response.json()) as { error?: string };

          if (response.status === 400 && result.error) {
            message = subscribeCopy.invalidEmail;
          }
        } catch {
          // Keep the default failure message.
        }

        setNote(message);
        setNoteState("error");
        inputRef.current?.focus();
        return;
      }

      const result = (await response.json()) as {
        welcomeEmail?: WelcomeEmailStatus;
      };
      welcomeEmail = result.welcomeEmail ?? "failed";
    } catch {
      setNote(subscribeCopy.subscribeFailed);
      setNoteState("error");
      inputRef.current?.focus();
      return;
    } finally {
      setIsSubmitting(false);
    }

    setSubscribedEmailSnapshot({ email: value, welcomeEmail });
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
            disabled={isSubmitting}
            data-od-id={
              inputId === "email" ? "subscribe-button" : "subscribe-button-2"
            }
          >
            {isSubmitting ? subscribeCopy.submitting : subscribeCopy.button}
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
          加入订阅名单。{resolvedSuccessEnding}
        </p>
      </div>
    </>
  );
}
