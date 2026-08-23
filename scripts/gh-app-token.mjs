#!/usr/bin/env node
// Mints a short-lived (1h) GitHub App installation access token for use as
// GH_TOKEN, so git/gh operations run as the app's bot identity instead of a
// personal account. Usage:
//   node scripts/gh-app-token.mjs --app-id <id> --key <path-to-pem> [--repo owner/name]

import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

const appId = arg("app-id");
const keyPath = arg("key");
const repo = arg("repo"); // optional "owner/name" filter when multiple installs exist

if (!appId || !keyPath) {
  console.error("Usage: gh-app-token.mjs --app-id <id> --key <path-to-pem> [--repo owner/name]");
  process.exit(1);
}

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signJwt(privateKeyPem, appId) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = { iat: now - 60, exp: now + 540, iss: appId };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = createSign("RSA-SHA256").update(signingInput).sign(privateKeyPem);
  return `${signingInput}.${base64url(signature).replace(/\+/g, "-").replace(/\//g, "_")}`;
}

async function gh(path, jwt, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`${options.method || "GET"} ${path} -> ${res.status} ${await res.text()}`);
  }
  return res.json();
}

const privateKey = readFileSync(keyPath, "utf8");
const jwt = signJwt(privateKey, appId);

const installations = await gh("/app/installations", jwt);
const installation = repo
  ? installations.find((i) => i.account && `${i.account.login}` === repo.split("/")[0])
  : installations[0];

if (!installation) {
  console.error("No matching installation found for this app.");
  process.exit(1);
}

const { token } = await gh(`/app/installations/${installation.id}/access_tokens`, jwt, { method: "POST" });
process.stdout.write(token);
