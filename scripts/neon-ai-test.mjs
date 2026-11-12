// Smoke test for the Neon AI Gateway. Run: node --env-file=.env.local scripts/neon-ai-test.mjs
import { neon } from "@neon/ai-sdk-provider";
import { generateText } from "ai";

const base = process.env.NEON_AI_GATEWAY_BASE_URL;
const token = process.env.NEON_AI_GATEWAY_TOKEN;
if (!base || !token) throw new Error("Missing NEON_AI_GATEWAY_* env vars (run `neon env pull`).");

const res = await fetch(`${base}/v1/models`, { headers: { Authorization: `Bearer ${token}` } });
if (!res.ok) throw new Error(`GET /v1/models failed: ${res.status}`);
const { data } = await res.json();
const enabled = data.filter((m) => m.enabled !== false);
console.log(`Models: ${data.length} total, ${enabled.length} enabled`);
for (const m of data) console.log(` - ${m.id}${m.enabled === false ? `  [disabled: ${m.unavailable_reason}]` : ""}`);

const pick = enabled.find((m) => /haiku|mini|flash/.test(m.id)) ?? enabled[0];
if (!pick) {
  console.log("\nNo enabled models, so no reply to show. Add a card and buy AI Gateway credits on the Neon Billing page.");
  process.exit(2);
}
const { text } = await generateText({ model: neon(pick.id), prompt: "Reply with one short friendly sentence." });
console.log(`\nReply from ${pick.id}: ${text}`);
