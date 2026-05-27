import { randomBytes } from "node:crypto";

import { queryOne } from "@/lib/db";

const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const lcsinPrefix = "LC";

function buildCandidate() {
  const bytes = randomBytes(10);
  let candidate = lcsinPrefix;

  for (const byte of bytes) {
    candidate += charset[byte % charset.length];
  }

  return candidate.slice(0, 12);
}

export async function generateUniqueLcsin() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = buildCandidate();
    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM products WHERE lcsin = ? LIMIT 1",
      [candidate],
    );

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Failed to generate a unique LCSIN.");
}

