import { Router } from "express";
import { db } from "@workspace/db";
import { articlesTable } from "@workspace/db";
import { eq, like, ilike, sql, and } from "drizzle-orm";
import {
  ListArticlesQueryParams,
  CreateArticleBody,
  GetArticleParams,
  UpdateArticleBody,
  UpdateArticleParams,
  DeleteArticleParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/articles", async (req, res) => {
  const parsed = ListArticlesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const { category, featured, limit, offset, search } = parsed.data;

  const conditions = [];
  if (category) conditions.push(eq(articlesTable.category, category));
  if (featured !== undefined) conditions.push(eq(articlesTable.featured, featured));
  if (search) conditions.push(ilike(articlesTable.title, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [articles, countResult] = await Promise.all([
    db
      .select()
      .from(articlesTable)
      .where(where)
      .orderBy(sql`${articlesTable.publishedAt} desc`)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(articlesTable)
      .where(where),
  ]);

  res.json({ articles, total: Number(countResult[0]?.count ?? 0) });
});

router.post("/articles", async (req, res) => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const [article] = await db.insert(articlesTable).values(parsed.data).returning();
  res.status(201).json(article);
});

router.get("/articles/featured", async (req, res) => {
  const articles = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.featured, true))
    .orderBy(sql`${articlesTable.publishedAt} desc`)
    .limit(3);
  res.json(articles);
});

router.get("/articles/stats", async (req, res) => {
  const [total, byCategory, featuredCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(articlesTable),
    db
      .select({ category: articlesTable.category, count: sql<number>`count(*)` })
      .from(articlesTable)
      .groupBy(articlesTable.category),
    db
      .select({ count: sql<number>`count(*)` })
      .from(articlesTable)
      .where(eq(articlesTable.featured, true)),
  ]);
  res.json({
    total: Number(total[0]?.count ?? 0),
    byCategory: byCategory.map((r) => ({ category: r.category, count: Number(r.count) })),
    featuredCount: Number(featuredCount[0]?.count ?? 0),
  });
});

router.get("/articles/:slug", async (req, res) => {
  const parsed = GetArticleParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const [article] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.slug, parsed.data.slug));
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(article);
});

router.put("/articles/:slug", async (req, res) => {
  const paramsParsed = UpdateArticleParams.safeParse(req.params);
  const bodyParsed = UpdateArticleBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [article] = await db
    .update(articlesTable)
    .set(bodyParsed.data)
    .where(eq(articlesTable.slug, paramsParsed.data.slug))
    .returning();
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  res.json(article);
});

router.delete("/articles/:slug", async (req, res) => {
  const parsed = DeleteArticleParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  await db.delete(articlesTable).where(eq(articlesTable.slug, parsed.data.slug));
  res.status(204).send();
});

export default router;
