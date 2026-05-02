import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const articlesTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  readTime: integer("read_time").notNull().default(5),
  wordCount: integer("word_count"),
  featured: boolean("featured").notNull().default(false),
  status: text("status").notNull().default("published"),
  viewCount: integer("view_count").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articlesTable).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articlesTable.$inferSelect;
