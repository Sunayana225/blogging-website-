import { Router } from "express";
import { createRateLimiter } from "../lib/rate-limit";
import {
  createAdminSession,
  getAdminSessionCookieName,
  getAdminSessionTtlMs,
  readAdminBootstrapToken,
  requireAdminAuth,
  revokeAdminSession,
  shouldUseSecureCookie,
  validateAdminSession,
  verifyAdminBootstrapToken,
} from "../lib/auth";

const router = Router();
const loginRateLimit = createRateLimiter({
  windowMs: 15 * 60_000,
  limit: 5,
  keyPrefix: "admin-login",
});
const sessionRateLimit = createRateLimiter({
  windowMs: 60_000,
  limit: 30,
  keyPrefix: "admin-session",
});

router.post("/admin/login", loginRateLimit, async (req, res) => {
  const bootstrapToken = readAdminBootstrapToken(req);
  if (!verifyAdminBootstrapToken(bootstrapToken ?? undefined)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { sessionToken, expiresAt } = await createAdminSession();

  res.cookie(getAdminSessionCookieName(), sessionToken, {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "strict",
    path: "/",
    maxAge: getAdminSessionTtlMs(),
  });

  res.json({ authenticated: true, expiresAt });
});

router.post("/admin/logout", sessionRateLimit, requireAdminAuth, async (req, res) => {
  await revokeAdminSession(req);

  res.clearCookie(getAdminSessionCookieName(), {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "strict",
    path: "/",
  });

  res.status(204).send();
});

router.get("/admin/session", sessionRateLimit, async (req, res) => {
  const session = await validateAdminSession(req);

  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
    lastSeenAt: session.lastSeenAt,
  });
});

export default router;