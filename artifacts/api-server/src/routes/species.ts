import { Router } from "express";
import { db } from "@workspace/db";
import { speciesTable } from "@workspace/db";
import { eq, ilike, and } from "drizzle-orm";
import {
  ListSpeciesQueryParams,
  CreateSpeciesBody,
  GetSpeciesParams,
  UpdateSpeciesParams,
  DeleteSpeciesParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/species", async (req, res) => {
  const parsed = ListSpeciesQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  const { kingdom, conservationStatus, search } = parsed.data;
  const conditions = [];
  if (kingdom) conditions.push(eq(speciesTable.kingdom, kingdom));
  if (conservationStatus) conditions.push(eq(speciesTable.conservationStatus, conservationStatus));
  if (search) conditions.push(ilike(speciesTable.commonName, `%${search}%`));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const species = await db.select().from(speciesTable).where(where).orderBy(speciesTable.commonName);
  res.json(species);
});

router.post("/species", async (req, res) => {
  const parsed = CreateSpeciesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  const [species] = await db.insert(speciesTable).values(parsed.data).returning();
  res.status(201).json(species);
});

router.get("/species/:slug", async (req, res) => {
  const parsed = GetSpeciesParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  const [species] = await db.select().from(speciesTable).where(eq(speciesTable.slug, parsed.data.slug));
  if (!species) { res.status(404).json({ error: "Species not found" }); return; }
  res.json(species);
});

router.put("/species/:slug", async (req, res) => {
  const paramsParsed = UpdateSpeciesParams.safeParse(req.params);
  const bodyParsed = CreateSpeciesBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [species] = await db.update(speciesTable).set(bodyParsed.data)
    .where(eq(speciesTable.slug, paramsParsed.data.slug)).returning();
  if (!species) { res.status(404).json({ error: "Species not found" }); return; }
  res.json(species);
});

router.delete("/species/:slug", async (req, res) => {
  const parsed = DeleteSpeciesParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  await db.delete(speciesTable).where(eq(speciesTable.slug, parsed.data.slug));
  res.status(204).send();
});

export default router;
