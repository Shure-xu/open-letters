type Subscriber = {
  id: string;
  email: string;
};

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin access is not configured.");
  }

  return {
    baseUrl: SUPABASE_URL.replace(/\/$/, ""),
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json"
    }
  };
}

async function supabaseRequest(path: string, init?: RequestInit) {
  const { baseUrl, headers } = getSupabaseConfig();
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...headers,
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status}).`);
  }

  return response;
}

export async function getActiveSubscribers(): Promise<Subscriber[]> {
  const response = await supabaseRequest(
    "subscribers?select=id,email&status=eq.active&order=created_at.asc"
  );

  return (await response.json()) as Subscriber[];
}

type EmailSendLog = {
  subscriberId: string;
  issueId: string;
  status: "sent" | "failed";
  providerMessageId?: string;
  errorMessage?: string;
  sentAt?: string;
};

export async function createEmailSendLog(log: EmailSendLog) {
  await supabaseRequest("email_sends", {
    method: "POST",
    headers: {
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      subscriber_id: log.subscriberId,
      issue_id: log.issueId,
      status: log.status,
      provider_message_id: log.providerMessageId ?? null,
      error_message: log.errorMessage ?? null,
      sent_at: log.sentAt ?? null
    })
  });
}
