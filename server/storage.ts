import {
  raffleEntries,
  prizes,
  winners,
  type RaffleEntry,
  type InsertRaffleEntry,
  type Prize,
  type InsertPrize,
  type Winner,
  type InsertWinner,
  type WinnerWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, not, inArray } from "drizzle-orm";

export interface IStorage {
  // Raffle entries
  getRaffleEntries(): Promise<RaffleEntry[]>;
  createRaffleEntry(entry: InsertRaffleEntry): Promise<RaffleEntry>;
  checkDuplicateEntry(firstName: string, lastName: string): Promise<RaffleEntry | undefined>;
  getEligibleEntries(): Promise<RaffleEntry[]>;
  markEntryAsWinner(entryId: string): Promise<void>;
  deleteRaffleEntry(entryId: string): Promise<void>;
  deleteAllRaffleEntries(): Promise<void>;

  // Prizes
  getPrizes(): Promise<Prize[]>;
  createPrize(prize: InsertPrize): Promise<Prize>;
  updatePrize(id: string, prize: Partial<Prize>): Promise<Prize>;
  markPrizeAsClaimed(prizeId: string): Promise<void>;
  deletePrize(prizeId: string): Promise<void>;
  deleteAllPrizes(): Promise<void>;

  // Winners
  getWinners(): Promise<WinnerWithDetails[]>;
  createWinner(winner: InsertWinner): Promise<Winner>;
  updateWinner(id: string, updates: Partial<Winner>): Promise<Winner>;
  getWinnerEntryIds(): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  // Raffle entries
  async getRaffleEntries(): Promise<RaffleEntry[]> {
    return await db.select().from(raffleEntries).orderBy(raffleEntries.entryTime);
  }

  async createRaffleEntry(entry: InsertRaffleEntry): Promise<RaffleEntry> {
    const [newEntry] = await db
      .insert(raffleEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async checkDuplicateEntry(firstName: string, lastName: string): Promise<RaffleEntry | undefined> {
    const [existing] = await db
      .select()
      .from(raffleEntries)
      .where(
        and(
          eq(raffleEntries.firstName, firstName),
          eq(raffleEntries.lastName, lastName)
        )
      );
    return existing;
  }

  async getEligibleEntries(): Promise<RaffleEntry[]> {
    const winnerEntryIds = await this.getWinnerEntryIds();
    
    if (winnerEntryIds.length === 0) {
      return await db.select().from(raffleEntries);
    }
    
    return await db
      .select()
      .from(raffleEntries)
      .where(not(inArray(raffleEntries.id, winnerEntryIds)));
  }

  async markEntryAsWinner(entryId: string): Promise<void> {
    await db
      .update(raffleEntries)
      .set({ hasWon: true })
      .where(eq(raffleEntries.id, entryId));
  }

  // Prizes
  async getPrizes(): Promise<Prize[]> {
    return await db.select().from(prizes).orderBy(prizes.createdAt);
  }

  async createPrize(prize: InsertPrize): Promise<Prize> {
    const [newPrize] = await db
      .insert(prizes)
      .values(prize)
      .returning();
    return newPrize;
  }

  async updatePrize(id: string, prize: Partial<Prize>): Promise<Prize> {
    const [updatedPrize] = await db
      .update(prizes)
      .set(prize)
      .where(eq(prizes.id, id))
      .returning();
    return updatedPrize;
  }

  async markPrizeAsClaimed(prizeId: string): Promise<void> {
    await db
      .update(prizes)
      .set({ isAvailable: false })
      .where(eq(prizes.id, prizeId));
  }

  // Winners
  async getWinners(): Promise<WinnerWithDetails[]> {
    return await db
      .select({
        id: winners.id,
        entryId: winners.entryId,
        prizeId: winners.prizeId,
        drawnAt: winners.drawnAt,
        claimedAt: winners.claimedAt,
        isNoShow: winners.isNoShow,
        entry: raffleEntries,
        prize: prizes,
      })
      .from(winners)
      .leftJoin(raffleEntries, eq(winners.entryId, raffleEntries.id))
      .leftJoin(prizes, eq(winners.prizeId, prizes.id))
      .orderBy(winners.drawnAt);
  }

  async createWinner(winner: InsertWinner): Promise<Winner> {
    const [newWinner] = await db
      .insert(winners)
      .values(winner)
      .returning();
    return newWinner;
  }

  async updateWinner(id: string, updates: Partial<Winner>): Promise<Winner> {
    const [updatedWinner] = await db
      .update(winners)
      .set(updates)
      .where(eq(winners.id, id))
      .returning();
    return updatedWinner;
  }

  async getWinnerEntryIds(): Promise<string[]> {
    const winnerEntries = await db
      .select({ entryId: winners.entryId })
      .from(winners)
      .where(eq(winners.isNoShow, false));
    
    return winnerEntries.map(w => w.entryId);
  }

  // Delete methods
  async deleteRaffleEntry(entryId: string): Promise<void> {
    // First delete any associated winners
    await db.delete(winners).where(eq(winners.entryId, entryId));
    // Then delete the entry
    await db.delete(raffleEntries).where(eq(raffleEntries.id, entryId));
  }

  async deleteAllRaffleEntries(): Promise<void> {
    // First delete all winners
    await db.delete(winners);
    // Then delete all entries
    await db.delete(raffleEntries);
  }

  async deletePrize(prizeId: string): Promise<void> {
    // Update any winners that have this prize to remove the prize assignment
    await db
      .update(winners)
      .set({ prizeId: null })
      .where(eq(winners.prizeId, prizeId));
    // Then delete the prize
    await db.delete(prizes).where(eq(prizes.id, prizeId));
  }

  async deleteAllPrizes(): Promise<void> {
    // Update all winners to remove prize assignments
    await db
      .update(winners)
      .set({ prizeId: null });
    // Then delete all prizes
    await db.delete(prizes);
  }
}

export const storage = new DatabaseStorage();
