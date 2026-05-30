import { Router } from "express";
import { db } from "@workspace/db";
import { newsletterSubscribersTable } from "@workspace/db";
import { SubscribeNewsletterBody } from "@workspace/api-zod";
import { createRateLimiter } from "../lib/rate-limit";

const router = Router();
const publicSubmitRateLimit = createRateLimiter({
  windowMs: 10 * 60_000,
  limit: 10,
  keyPrefix: "public-submit",
});

router.post("/newsletter", publicSubmitRateLimit, async (req, res) => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const [subscriber] = await db
    .insert(newsletterSubscribersTable)
    .values(parsed.data)
    .onConflictDoNothing()
    .returning();
  res.status(201).json(subscriber ?? { message: "Already subscribed" });
});

router.get("/newsletter", async (req, res) => {
  const subscribers = await db.select().from(newsletterSubscribersTable).orderBy(newsletterSubscribersTable.createdAt);
  res.json(subscribers);
});

export default router;
