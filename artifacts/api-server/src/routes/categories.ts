import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, articlesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";
import { requireAdminAuth } from "../lib/auth";
import { createRateLimiter } from "../lib/rate-limit";

const router = Router();
const adminWriteRateLimit = createRateLimiter({
  windowMs: 60_000,
  limit: 20,
  keyPrefix: "admin-write",
});

router.get("/categories", async (req, res) => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(categories);
});

router.post("/categories", requireAdminAuth, adminWriteRateLimit, async (req, res) => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  const [category] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json(category);
});

router.get("/categories/:slug", async (req, res) => {
  const [category] = await db.select().from(categoriesTable)
    .where(eq(categoriesTable.slug, req.params.slug));
  if (!category) { res.status(404).json({ error: "Category not found" }); return; }
  const articles = await db.select().from(articlesTable)
    .where(eq(articlesTable.category, category.name))
    .orderBy(sql`${articlesTable.publishedAt} desc`);
  res.json({ ...category, articles });
});

router.delete("/categories/:slug", requireAdminAuth, adminWriteRateLimit, async (req, res) => {
  await db.delete(categoriesTable).where(eq(categoriesTable.slug, req.params.slug));
  res.status(204).send();
});

export default router;
