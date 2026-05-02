import { pgTable, text, serial, integer, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { articlesTable } from "./articles";

export const tagsTable = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const articleTagsTable = pgTable("article_tags", {
  articleId: integer("article_id").notNull().references(() => articlesTable.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tagsTable.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.articleId, t.tagId] })]);

export const insertTagSchema = createInsertSchema(tagsTable).omit({ id: true });
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tagsTable.$inferSelect;
