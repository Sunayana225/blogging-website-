import { Router } from "express";
import { db } from "@workspace/db";
import { portfolioClipsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  ListPortfolioClipsQueryParams,
  CreatePortfolioClipBody,
  DeletePortfolioClipParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/portfolio", async (req, res) => {
  const parsed = ListPortfolioClipsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const { category } = parsed.data;

  const clips = await db
    .select()
    .from(portfolioClipsTable)
    .where(category ? eq(portfolioClipsTable.category, category) : undefined)
    .orderBy(sql`${portfolioClipsTable.date} desc`);

  res.json(clips);
});

router.post("/portfolio", async (req, res) => {
  const parsed = CreatePortfolioClipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const [clip] = await db.insert(portfolioClipsTable).values(parsed.data).returning();
  res.status(201).json(clip);
});

router.delete("/portfolio/:id", async (req, res) => {
  const parsed = DeletePortfolioClipParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  await db.delete(portfolioClipsTable).where(eq(portfolioClipsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
