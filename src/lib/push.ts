import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:hola@tueresmigasolina.com";
const SUBS_GIST_ID = process.env.PUSH_SUBSCRIPTIONS_GIST_ID ?? "";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";

function configureVapid(): boolean {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  return true;
}

function gistHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function readPushSubs(): Promise<webpush.PushSubscription[]> {
  if (!GITHUB_TOKEN || !SUBS_GIST_ID) return [];
  try {
    const res = await fetch(`https://api.github.com/gists/${SUBS_GIST_ID}`, {
      headers: gistHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const gist = (await res.json()) as { files: Record<string, { content: string }> };
    const key = Object.keys(gist.files)[0];
    if (!key) return [];
    const parsed = JSON.parse(gist.files[key].content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writePushSubs(subs: webpush.PushSubscription[]): Promise<void> {
  if (!GITHUB_TOKEN || !SUBS_GIST_ID) return;
  try {
    const headers = gistHeaders();
    const get = await fetch(`https://api.github.com/gists/${SUBS_GIST_ID}`, { headers });
    if (!get.ok) return;
    const gist = (await get.json()) as {
      files: Record<string, { content: string; filename: string }>;
    };
    const key = Object.keys(gist.files)[0];
    if (!key) return;
    await fetch(`https://api.github.com/gists/${SUBS_GIST_ID}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        files: {
          [key]: {
            content: JSON.stringify(subs, null, 2),
            filename: gist.files[key].filename,
          },
        },
      }),
    });
  } catch {
    // ignore
  }
}

export async function savePushSub(subscription: webpush.PushSubscription): Promise<boolean> {
  const subs = await readPushSubs();
  const exists = subs.some((s) => s.endpoint === subscription.endpoint);
  if (!exists) {
    subs.push(subscription);
    await writePushSubs(subs);
  }
  return true;
}

export async function sendPushToAll(payload: {
  title: string;
  body: string;
  url?: string;
}): Promise<void> {
  if (!configureVapid()) return;
  const subs = await readPushSubs();
  if (subs.length === 0) return;

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        sub,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          url: payload.url ?? "/panel",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
        }),
      ),
    ),
  );

  const failed = results
    .map((r, i) => ({ r, sub: subs[i] }))
    .filter(({ r }) => r.status === "rejected");
  if (failed.length > 0) {
    const deadEndpoints = new Set(
      failed.map(({ sub }) => sub.endpoint),
    );
    const alive = subs.filter((s) => !deadEndpoints.has(s.endpoint));
    await writePushSubs(alive);
  }
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

export { configureVapid };
