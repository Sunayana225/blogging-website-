import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const portfolioClipsTable = pgTable("portfolio_clips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  publication: text("publication").notNull(),
  url: text("url").notNull(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPortfolioClipSchema = createInsertSchema(portfolioClipsTable).omit({ id: true, createdAt: true });
export type InsertPortfolioClip = z.infer<typeof insertPortfolioClipSchema>;
export type PortfolioClip = typeof portfolioClipsTable.$inferSelect;
