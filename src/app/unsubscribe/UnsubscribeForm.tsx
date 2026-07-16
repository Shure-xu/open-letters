"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "./unsubscribe.module.css";

export function UnsubscribeForm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

      setState(response.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className={styles.card}>
        <div className={styles.brand}>
          open letters <span>.</span>
        </div>
        <h1>已经退订</h1>
        <p>之后我们不会再向这个邮箱发送 newsletter。感谢你曾经和我们一起阅读。</p>
        <Link href="/">返回首页</Link>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.brand}>
        open letters <span>.</span>
      </div>
      <h1>确认退订</h1>
      <p>确认后，你将不再收到每天早上 8:00 的 open letters。</p>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={!token || state === "submitting"}>
          {state === "submitting" ? "正在处理" : "确认退订"}
        </button>
      </form>
      {!token && <p className={styles.error}>这个退订链接不完整。</p>}
      {state === "error" && (
        <p className={styles.error}>暂时无法退订，请稍后再试。</p>
      )}
      <Link href="/">暂不退订，返回首页</Link>
    </div>
  );
}
