import { Router } from "express";
import { db } from "@workspace/db";
import { contactMessagesTable } from "@workspace/db";
import { SubmitContactBody } from "@workspace/api-zod";
import { createRateLimiter } from "../lib/rate-limit";

const router = Router();
const publicSubmitRateLimit = createRateLimiter({
  windowMs: 10 * 60_000,
  limit: 10,
  keyPrefix: "public-submit",
});

router.post("/contact", publicSubmitRateLimit, async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const [message] = await db.insert(contactMessagesTable).values(parsed.data).returning();
  res.status(201).json(message);
});

export default router;
