import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Route: Generate Report Narrative using Gemini
app.post("/api/generate-narrative", async (req, res) => {
  try {
    const { promoterName, address, businessType, vehicleName, baseCost, loanAmount, tenureYears } = req.body;

    const client = getAiClient();
    
    const systemPrompt = `
      Act as a professional Chartered Accountant preparing a formal bank loan project report for a commercial vehicle.
      Generate three structured sections in clean HTML:
      1. INTRODUCTION: A comprehensive business profile of the promoter, the vehicle acquisition plan, and project background.
      2. MARKET POTENTIAL & OPERATIONAL PROCESS: Analysis of transport/vehicle demand, local business landscape, and how the operational logistics will work.
      3. MARKETING STRATEGY & VIABILITY: How the promoter will acquire transport clients, secure contracts, maintain high vehicle utilization, and ensure strong financial viability for debt servicing.

      Format the output STRICTLY in HTML using standard tags like:
      - <h3 style="font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 1.5rem; margin-bottom: 0.75rem;">
      - <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">
      - <ul> and <li> for lists.
      Do not include markdown codeblocks (like \`\`\`html) or raw markdown. Output raw HTML directly.
      Keep it highly formal, professional, persuasive for a bank credit manager, and contextualized to the specific inputs provided.
    `;

    const userPrompt = `
      Promoter Name: ${promoterName || "Shri Manjunath Mallappa Patil"}
      Location/Address: ${address || "Chikkodi Road, Tq Raibag, Dist Belagavi"}
      Business Type: ${businessType || "Taxi/Commercial Transportation"}
      Vehicle Asset to be Financed: ${vehicleName || "Commercial Taxi"}
      Vehicle Cost: Rs. ${baseCost || "910,000"}
      Requested Bank Loan: Rs. ${loanAmount || "874,000"}
      Repayment Period: ${tenureYears || "5"} Years
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const narrativeHtml = response.text || "";
    // Clean any accidental markdown codeblock wrappers
    const sanitizedHtml = narrativeHtml
      .replace(/```html\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    res.json({ success: true, text: sanitizedHtml });
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "An error occurred while generating the report narrative." 
    });
  }
});

// API Route: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Setup Vite Dev Server / Static Asset Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
