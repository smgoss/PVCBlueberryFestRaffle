import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const raffleEntries = pgTable("raffle_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  entryTime: timestamp("entry_time").defaultNow().notNull(),
  hasWon: boolean("has_won").default(false).notNull(),
});

export const prizes = pgTable("prizes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const winners = pgTable("winners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryId: varchar("entry_id").notNull().references(() => raffleEntries.id),
  prizeId: varchar("prize_id").references(() => prizes.id),
  drawnAt: timestamp("drawn_at").defaultNow().notNull(),
  claimedAt: timestamp("claimed_at"),
  isNoShow: boolean("is_no_show").default(false).notNull(),
});

export const winnersRelations = relations(winners, ({ one }) => ({
  entry: one(raffleEntries, {
    fields: [winners.entryId],
    references: [raffleEntries.id],
  }),
  prize: one(prizes, {
    fields: [winners.prizeId],
    references: [prizes.id],
  }),
}));

export const raffleEntriesRelations = relations(raffleEntries, ({ many }) => ({
  winners: many(winners),
}));

export const prizesRelations = relations(prizes, ({ many }) => ({
  winners: many(winners),
}));

export const insertRaffleEntrySchema = createInsertSchema(raffleEntries).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
}).extend({
  firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
  email: z.string().email("Please enter a valid email address").max(255, "Email too long"),
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\d{3}-\d{3}-\d{4}$/, "Phone must be exactly 10 digits in format 555-123-4567")
    .refine((phone) => phone.replace(/\D/g, '').length === 10, "Phone number must be exactly 10 digits"),
});

export const insertPrizeSchema = createInsertSchema(prizes).pick({
  name: true,
  description: true,
});

export const insertWinnerSchema = createInsertSchema(winners).pick({
  entryId: true,
  prizeId: true,
});

export type InsertRaffleEntry = z.infer<typeof insertRaffleEntrySchema>;
export type RaffleEntry = typeof raffleEntries.$inferSelect;
export type InsertPrize = z.infer<typeof insertPrizeSchema>;
export type Prize = typeof prizes.$inferSelect;
export type InsertWinner = z.infer<typeof insertWinnerSchema>;
export type Winner = typeof winners.$inferSelect;

export type WinnerWithDetails = Winner & {
  entry: RaffleEntry | null;
  prize: Prize | null;
};
