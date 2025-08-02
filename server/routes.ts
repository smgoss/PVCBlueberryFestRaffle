import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRaffleEntrySchema, insertPrizeSchema, insertWinnerSchema } from "@shared/schema";
import { z } from "zod";

const ADMIN_PASSWORD = "Jesus4All!";

// Admin authentication middleware
const requireAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const password = authHeader.substring(7); // Remove 'Bearer ' prefix
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin password" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Public routes
  app.post("/api/raffle-entries", async (req, res) => {
    try {
      const entryData = insertRaffleEntrySchema.parse(req.body);
      
      // Check for duplicate name combination
      const existing = await storage.checkDuplicateEntry(entryData.firstName, entryData.lastName);
      if (existing) {
        return res.status(400).json({ 
          message: "An entry with this first and last name combination already exists." 
        });
      }
      
      const entry = await storage.createRaffleEntry(entryData);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating raffle entry:", error);
      res.status(500).json({ message: "Failed to create raffle entry" });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: ADMIN_PASSWORD });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin routes
  app.get("/api/admin/entries", requireAdmin, async (req, res) => {
    try {
      const entries = await storage.getRaffleEntries();
      const winnerEntryIds = await storage.getWinnerEntryIds();
      
      const entriesWithStatus = entries.map(entry => ({
        ...entry,
        status: winnerEntryIds.includes(entry.id) ? 'winner' : 'eligible'
      }));
      
      res.json(entriesWithStatus);
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  app.get("/api/admin/prizes", requireAdmin, async (req, res) => {
    try {
      const prizes = await storage.getPrizes();
      res.json(prizes);
    } catch (error) {
      console.error("Error fetching prizes:", error);
      res.status(500).json({ message: "Failed to fetch prizes" });
    }
  });

  app.post("/api/admin/prizes", requireAdmin, async (req, res) => {
    try {
      const prizeData = insertPrizeSchema.parse(req.body);
      const prize = await storage.createPrize(prizeData);
      res.json(prize);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating prize:", error);
      res.status(500).json({ message: "Failed to create prize" });
    }
  });

  app.get("/api/admin/winners", requireAdmin, async (req, res) => {
    try {
      const winners = await storage.getWinners();
      res.json(winners);
    } catch (error) {
      console.error("Error fetching winners:", error);
      res.status(500).json({ message: "Failed to fetch winners" });
    }
  });

  app.post("/api/admin/draw-winner", requireAdmin, async (req, res) => {
    try {
      const eligibleEntries = await storage.getEligibleEntries();
      
      if (eligibleEntries.length === 0) {
        return res.status(400).json({ message: "No eligible entries available for drawing" });
      }
      
      // Randomly select a winner
      const randomIndex = Math.floor(Math.random() * eligibleEntries.length);
      const selectedEntry = eligibleEntries[randomIndex];
      
      res.json(selectedEntry);
    } catch (error) {
      console.error("Error drawing winner:", error);
      res.status(500).json({ message: "Failed to draw winner" });
    }
  });

  app.post("/api/admin/confirm-winner", requireAdmin, async (req, res) => {
    try {
      const { entryId } = req.body;
      
      if (!entryId) {
        return res.status(400).json({ message: "Entry ID is required" });
      }
      
      // Create winner record without prize assignment
      const winner = await storage.createWinner({ entryId });
      
      // Mark entry as winner
      await storage.markEntryAsWinner(entryId);
      
      res.json(winner);
    } catch (error) {
      console.error("Error confirming winner:", error);
      res.status(500).json({ message: "Failed to confirm winner" });
    }
  });

  app.patch("/api/admin/winners/:id/claim-prize", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { prizeId } = req.body;
      
      if (!prizeId) {
        return res.status(400).json({ message: "Prize ID is required" });
      }
      
      // Update winner with prize and claim time
      const updatedWinner = await storage.updateWinner(id, {
        prizeId,
        claimedAt: new Date(),
      });
      
      // Mark prize as claimed
      await storage.markPrizeAsClaimed(prizeId);
      
      res.json(updatedWinner);
    } catch (error) {
      console.error("Error claiming prize:", error);
      res.status(500).json({ message: "Failed to claim prize" });
    }
  });

  app.patch("/api/admin/winners/:id/no-show", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mark winner as no-show
      const updatedWinner = await storage.updateWinner(id, {
        isNoShow: true,
      });
      
      res.json(updatedWinner);
    } catch (error) {
      console.error("Error marking no-show:", error);
      res.status(500).json({ message: "Failed to mark as no-show" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
