import { Router } from "express";
import { db } from "@workspace/db";
import { tagsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTagBody, DeleteTagParams } from "@workspace/api-zod";

const router = Router();

router.get("/tags", async (req, res) => {
  const tags = await db.select().from(tagsTable).orderBy(tagsTable.name);
  res.json(tags);
});

router.post("/tags", async (req, res) => {
  const parsed = CreateTagBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  const [tag] = await db.insert(tagsTable).values(parsed.data).returning();
  res.status(201).json(tag);
});

router.delete("/tags/:id", async (req, res) => {
  const parsed = DeleteTagParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  await db.delete(tagsTable).where(eq(tagsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
