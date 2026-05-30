import { type RequestHandler } from "express";
import { db, adminSessionsTable } from "@workspace/db";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";

const ADMIN_SESSION_COOKIE = "wildleaf_journal_admin_session";
const ADMIN_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isTokenMatch(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getSessionToken(req: Parameters<RequestHandler>[0]): string | null {
  const cookieToken = req.cookies?.[ADMIN_SESSION_COOKIE];
  return typeof cookieToken === "string" && cookieToken.trim() ? cookieToken.trim() : null;
}

function readBearerToken(authorization: string | undefined): string | null {
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function getAdminSessionCookieName(): string {
  return ADMIN_SESSION_COOKIE;
}

export function getAdminSessionTtlMs(): number {
  return ADMIN_SESSION_TTL_MS;
}

export function shouldUseSecureCookie(): boolean {
  return process.env.NODE_ENV === "production";
}

export function verifyAdminBootstrapToken(token: string | undefined): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN?.trim();
  if (!adminToken || !token) return false;
  return isTokenMatch(token.trim(), adminToken);
}

export function readAdminBootstrapToken(req: Parameters<RequestHandler>[0]): string | null {
  return readBearerToken(req.get("authorization"));
}

export async function createAdminSession() {
  await db.delete(adminSessionsTable);

  const sessionToken = randomBytes(32).toString("base64url");
  const sessionIdHash = hashSessionToken(sessionToken);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS);

  await db.insert(adminSessionsTable).values({
    sessionIdHash,
    expiresAt,
    lastSeenAt: new Date(),
  });

  return { sessionToken, expiresAt };
}

export async function validateAdminSession(req: Parameters<RequestHandler>[0]) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) return null;

  const sessionIdHash = hashSessionToken(sessionToken);
  const [session] = await db
    .select()
    .from(adminSessionsTable)
    .where(eq(adminSessionsTable.sessionIdHash, sessionIdHash));

  if (!session) return null;

  if (session.expiresAt <= new Date()) {
    await db.delete(adminSessionsTable).where(eq(adminSessionsTable.sessionIdHash, sessionIdHash));
    return null;
  }

  await db
    .update(adminSessionsTable)
    .set({ lastSeenAt: new Date() })
    .where(eq(adminSessionsTable.sessionIdHash, sessionIdHash));

  return session;
}

export async function revokeAdminSession(req: Parameters<RequestHandler>[0]) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) return;

  const sessionIdHash = hashSessionToken(sessionToken);
  await db.delete(adminSessionsTable).where(eq(adminSessionsTable.sessionIdHash, sessionIdHash));
}

export const requireAdminAuth: RequestHandler = async (req, res, next) => {
  const session = await validateAdminSession(req);

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
};

