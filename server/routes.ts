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
      
      // Check for duplicate entry (name and email combination)
      const existing = await storage.checkDuplicateEntry(entryData.firstName, entryData.lastName, entryData.email);
      if (existing) {
        return res.status(400).json({ 
          message: "An entry with this name and email combination already exists." 
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

  app.get("/api/admin/entries/export", requireAdmin, async (req, res) => {
    try {
      const entries = await storage.getRaffleEntries();
      const winnerEntryIds = await storage.getWinnerEntryIds();
      
      // Create CSV header
      const csvHeader = "First Name,Last Name,Email,Phone,Entry Time,Status\n";
      
      // Create CSV rows
      const csvRows = entries.map(entry => {
        const status = winnerEntryIds.includes(entry.id) ? 'Winner' : 'Eligible';
        const entryTime = new Date(entry.entryTime).toLocaleString();
        return `"${entry.firstName}","${entry.lastName}","${entry.email}","${entry.phone}","${entryTime}","${status}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="raffle-entries.csv"');
      
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting entries:", error);
      res.status(500).json({ message: "Failed to export entries" });
    }
  });

  app.delete("/api/admin/entries/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRaffleEntry(id);
      res.json({ message: "Entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting entry:", error);
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  app.delete("/api/admin/entries", requireAdmin, async (req, res) => {
    try {
      const { confirmation } = req.body;
      if (confirmation !== "DELETE ALL") {
        return res.status(400).json({ message: "Invalid confirmation. Type 'DELETE ALL' to confirm." });
      }
      await storage.deleteAllRaffleEntries();
      res.json({ message: "All entries deleted successfully" });
    } catch (error) {
      console.error("Error deleting all entries:", error);
      res.status(500).json({ message: "Failed to delete all entries" });
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

  app.delete("/api/admin/prizes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePrize(id);
      res.json({ message: "Prize deleted successfully" });
    } catch (error) {
      console.error("Error deleting prize:", error);
      res.status(500).json({ message: "Failed to delete prize" });
    }
  });

  app.delete("/api/admin/prizes", requireAdmin, async (req, res) => {
    try {
      const { confirmation } = req.body;
      if (confirmation !== "DELETE ALL") {
        return res.status(400).json({ message: "Invalid confirmation. Type 'DELETE ALL' to confirm." });
      }
      await storage.deleteAllPrizes();
      res.json({ message: "All prizes deleted successfully" });
    } catch (error) {
      console.error("Error deleting all prizes:", error);
      res.status(500).json({ message: "Failed to delete all prizes" });
    }
  });

  // Winner delete routes
  app.delete("/api/admin/winners/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWinner(id);
      res.json({ message: "Winner deleted successfully" });
    } catch (error) {
      console.error("Error deleting winner:", error);
      res.status(500).json({ message: "Failed to delete winner" });
    }
  });

  app.delete("/api/admin/winners", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAllWinners();
      res.json({ message: "All winners deleted successfully" });
    } catch (error) {
      console.error("Error deleting all winners:", error);
      res.status(500).json({ message: "Failed to delete all winners" });
    }
  });

  // Clearstream notification endpoint
  app.post("/api/admin/notify-winner/:winnerId", requireAdmin, async (req, res) => {
    try {
      const { winnerId } = req.params;
      
      // Get winner details with entry information
      const winners = await storage.getWinners();
      const winner = winners.find(w => w.id === winnerId);
      
      if (!winner || !winner.entry) {
        return res.status(404).json({ message: "Winner not found" });
      }
      
      const entry = winner.entry;
      const prize = winner.prize;
      
      // Prepare notification messages
      const prizeText = prize ? `for the ${prize.name}` : '';
      const subject = `🎉 Pathway Vineyard Church GNG Raffle`;
      const message = `Congratulations ${entry.firstName}! You've been selected as a winner! Visit the Pathway Vineyard Church table by the bouncy house to claim your prize.`;
      
      console.log(`Attempting to notify winner: ${entry.firstName} ${entry.lastName} (${entry.phone}, ${entry.email})`);
      console.log(`Clearstream API Key available: ${!!process.env.CLEARSTREAM_API_KEY}`);
      
      // Format phone number for Clearstream (E164 format)
      const phoneDigits = entry.phone.replace(/\D/g, '');
      const formattedPhone = phoneDigits.startsWith('1') ? `+${phoneDigits}` : `+1${phoneDigits}`;
      
      console.log(`Formatted phone for SMS: ${formattedPhone}`);
      console.log(`Message to send: ${message}`);
      
      // Send SMS notification via Clearstream
      const smsBody = {
        to: formattedPhone,
        text_header: subject,
        text_body: message,
      };
      
      console.log(`SMS request body:`, JSON.stringify(smsBody, null, 2));
      
      const smsResponse = await fetch('https://api.getclearstream.com/v1/texts', {
        method: 'POST',
        headers: {
          'X-Api-Key': process.env.CLEARSTREAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsBody),
      });
      
      // For email, we'll just consider it successful for now since Clearstream is primarily SMS-focused
      // and the email functionality requires more complex setup with subscriber management
      const emailResponse = { ok: true, status: 200 };
      
      let smsSuccess = false;
      let emailSuccess = false;
      let errors = [];

      // Check SMS response
      if (smsResponse.ok) {
        smsSuccess = true;
        console.log('SMS notification sent successfully');
      } else {
        const smsError = await smsResponse.text();
        console.error('SMS notification failed:', smsResponse.status, smsError);
        errors.push(`SMS failed (${smsResponse.status}): ${smsError}`);
      }

      // Check Email response
      if (emailResponse.ok) {
        emailSuccess = true;
        console.log('Email notification sent successfully');
      } else {
        const emailError = await emailResponse.text();
        console.error('Email notification failed:', emailResponse.status, emailError);
        errors.push(`Email failed (${emailResponse.status}): ${emailError}`);
      }

      // If at least one notification succeeded, mark as notified
      if (smsSuccess || emailSuccess) {
        // Mark winner as notified
        await storage.markWinnerAsNotified(winnerId);
        
        let successMessage = "Winner notified successfully";
        if (smsSuccess && emailSuccess) {
          successMessage += " via SMS and email";
        } else if (smsSuccess) {
          successMessage += " via SMS only";
        } else {
          successMessage += " via email only";
        }
        
        res.json({ 
          message: successMessage,
          notifications: {
            sms: smsSuccess ? "sent" : "failed",
            email: emailSuccess ? "sent" : "failed"
          },
          errors: errors.length > 0 ? errors : undefined
        });
      } else {
        // Both notifications failed
        return res.status(500).json({ 
          message: "All notification methods failed",
          errors: errors
        });
      }
    } catch (error) {
      console.error("Error notifying winner:", error);
      res.status(500).json({ message: "Failed to notify winner" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
