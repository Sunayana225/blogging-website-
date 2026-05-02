import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { articlesTable } from "./articles";

export const speciesTable = pgTable("species", {
  id: serial("id").primaryKey(),
  commonName: text("common_name").notNull(),
  scientificName: text("scientific_name").notNull(),
  slug: text("slug").notNull().unique(),
  kingdom: text("kingdom"),
  speciesClass: text("species_class"),
  orderName: text("order_name"),
  family: text("family"),
  conservationStatus: text("conservation_status"),
  habitat: text("habitat"),
  geographicRange: text("geographic_range"),
  diet: text("diet"),
  description: text("description"),
  funFacts: text("fun_facts"),
  imageUrl: text("image_url"),
  iucnUrl: text("iucn_url"),
  articleId: integer("article_id").references(() => articlesTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSpeciesSchema = createInsertSchema(speciesTable).omit({ id: true, createdAt: true });
export type InsertSpecies = z.infer<typeof insertSpeciesSchema>;
export type Species = typeof speciesTable.$inferSelect;
