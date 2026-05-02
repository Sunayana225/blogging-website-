import { Router } from "express";
import { db } from "@workspace/db";
import { newsletterSubscribersTable } from "@workspace/db";
import { SubscribeNewsletterBody } from "@workspace/api-zod";

const router = Router();

router.post("/newsletter", async (req, res) => {
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
