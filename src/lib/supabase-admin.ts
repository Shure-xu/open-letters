export type Subscriber = {
  id: string;
  email: string;
  unsubscribe_token: string;
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
    "subscribers?select=id,email,unsubscribe_token&status=eq.active&order=created_at.asc"
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

type UpsertSubscriberInput = {
  email: string;
  source: string;
  unsubscribeToken: string;
  updatedAt: string;
};

export async function upsertSubscriber(
  input: UpsertSubscriberInput
): Promise<Subscriber> {
  const response = await supabaseRequest("subscribers?on_conflict=email", {
    method: "POST",
    headers: {
      Prefer: "resolution=ignore-duplicates,return=representation"
    },
    body: JSON.stringify({
      email: input.email,
      status: "active",
      source: input.source,
      unsubscribe_token: input.unsubscribeToken,
      updated_at: input.updatedAt
    })
  });
  const subscribers = (await response.json()) as Subscriber[];
  const insertedSubscriber = subscribers[0];

  if (insertedSubscriber) return insertedSubscriber;

  const updateResponse = await supabaseRequest(
    `subscribers?email=eq.${encodeURIComponent(input.email)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        status: "active",
        source: input.source,
        updated_at: input.updatedAt
      })
    }
  );
  const updatedSubscribers = (await updateResponse.json()) as Subscriber[];
  const subscriber = updatedSubscribers[0];

  if (!subscriber) {
    throw new Error("Supabase did not return the subscriber.");
  }

  return subscriber;
}

export async function reserveEmailSend(
  subscriberId: string,
  issueId: string
) {
  const response = await supabaseRequest(
    "email_sends?on_conflict=subscriber_id,issue_id",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=ignore-duplicates,return=representation"
      },
      body: JSON.stringify({
        subscriber_id: subscriberId,
        issue_id: issueId,
        status: "pending"
      })
    }
  );
  const rows = (await response.json()) as Array<{ id: string }>;

  if (rows.length === 1) return "reserved" as const;

  const retryResponse = await supabaseRequest(
    `email_sends?subscriber_id=eq.${encodeURIComponent(subscriberId)}&issue_id=eq.${encodeURIComponent(issueId)}&status=eq.failed`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        status: "pending",
        provider_message_id: null,
        error_message: null,
        sent_at: null
      })
    }
  );
  const retriedRows = (await retryResponse.json()) as Array<{ id: string }>;

  return retriedRows.length === 1 ? ("reserved" as const) : ("existing" as const);
}

type UpdateEmailSendInput = {
  status: "sent" | "failed";
  providerMessageId?: string;
  errorMessage?: string;
  sentAt?: string;
};

export async function updateEmailSend(
  subscriberId: string,
  issueId: string,
  update: UpdateEmailSendInput
) {
  await supabaseRequest(
    `email_sends?subscriber_id=eq.${encodeURIComponent(subscriberId)}&issue_id=eq.${encodeURIComponent(issueId)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        status: update.status,
        provider_message_id: update.providerMessageId ?? null,
        error_message: update.errorMessage ?? null,
        sent_at: update.sentAt ?? null
      })
    }
  );
}

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

export async function unsubscribeSubscriber(unsubscribeToken: string) {
  const response = await supabaseRequest(
    `subscribers?unsubscribe_token=eq.${encodeURIComponent(unsubscribeToken)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        status: "unsubscribed",
        updated_at: new Date().toISOString()
      })
    }
  );
  const rows = (await response.json()) as Array<{ id: string }>;

  return rows.length === 1;
}
