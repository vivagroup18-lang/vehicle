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

// Helper function to call generateContent with retry and model fallback
async function generateContentWithRetryAndFallback(
  client: GoogleGenAI,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  const maxRetriesPerModel = 3;
  let lastError: any = null;

  for (const model of modelsToTry) {
    let delayMs = 1000;
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        console.log(`Attempting generation with model ${model}, attempt ${attempt}/${maxRetriesPerModel}...`);
        const response = await client.models.generateContent({
          model: model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });
        
        if (response && response.text) {
          console.log(`Generation succeeded with model ${model} on attempt ${attempt}`);
          return response.text;
        }
        throw new Error("Empty response received from Gemini API");
      } catch (error: any) {
        lastError = error;
        const errorMessage = error.message || "";
        const isTransient = 
          error.status === 503 || 
          error.statusCode === 503 || 
          errorMessage.includes("503") || 
          errorMessage.includes("high demand") || 
          errorMessage.includes("temporary") ||
          errorMessage.includes("resource exhausted") || 
          error.status === 429 || 
          error.statusCode === 429 || 
          errorMessage.includes("429") ||
          errorMessage.includes("Quota exceeded");

        if (isTransient) {
          console.log(`[Transient Notice] Gemini API error on ${model} (attempt ${attempt}/${maxRetriesPerModel}): ${errorMessage}`);
          if (attempt < maxRetriesPerModel) {
            console.log(`Waiting ${delayMs}ms before retrying...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            delayMs *= 2; // Exponential backoff
            continue;
          }
        } else {
          // If it's a non-transient error (e.g. invalid auth, invalid schema, bad request), don't keep retrying this model
          console.log(`[Non-Transient Notice] Gemini API error on ${model}: ${errorMessage}`);
          break; 
        }
      }
    }
    console.log(`Model ${model} failed or timed out. Trying fallback model if available...`);
  }

  // If we exhausted all models and retries, throw a meaningful error
  const errMsg = lastError?.message || "";
  if (errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("temporary")) {
    throw new Error(
      "The Gemini AI service is currently experiencing extremely high demand. " +
      "We automatically retried and attempted fallback models, but the server is still busy. " +
      "Please wait a few moments and click 'Generate Narrative' again."
    );
  } else if (errMsg.includes("429") || errMsg.includes("Quota exceeded")) {
    throw new Error(
      "The API quota has been temporarily exceeded due to high traffic. " +
      "Please wait a few moments and try again."
    );
  }
  throw lastError || new Error("Failed to generate content with Gemini API after retrying.");
}

// API Route: Generate Report Narrative using Gemini
app.post("/api/generate-narrative", async (req, res) => {
  try {
    const { 
      promoterName, 
      address, 
      businessType, 
      vehicleName, 
      baseCost, 
      bodyBuilding, 
      workingCapital, 
      loanAmount, 
      subsidy, 
      subsidyTreatment,
      tenureYears 
    } = req.body;
 
    const client = getAiClient();
 
    const bCost = Number(baseCost) || 0;
    const bBuilding = Number(bodyBuilding) || 0;
    const wCapital = Number(workingCapital) || 0;
    const lAmount = Number(loanAmount) || 0;
    const sub = Number(subsidy) || 0;
    const subTreatment = subsidyTreatment || "margin";
 
    const totalProjectCost = bCost + bBuilding + wCapital;
    const treatAsMargin = subTreatment !== "investment";
    const marginMoney = Math.max(0, totalProjectCost - lAmount - (treatAsMargin ? sub : 0));
    const subsidyPct = totalProjectCost > 0 ? ((sub / totalProjectCost) * 100).toFixed(1) : "0.0";
    const marginPct = totalProjectCost > 0 ? ((marginMoney / totalProjectCost) * 100).toFixed(1) : "0.0";
    const loanPct = totalProjectCost > 0 ? ((lAmount / totalProjectCost) * 100).toFixed(1) : "0.0";
    
    const systemPrompt = `
      Act as a professional Chartered Accountant preparing a formal bank loan project report for a commercial vehicle.
      Generate three structured sections in clean HTML:
      1. INTRODUCTION: A comprehensive business profile of the promoter, the vehicle acquisition plan, and project background.
         - You MUST provide a clear capital structure and funding breakdown.
         - You MUST explicitly display and discuss the Total Project Cost of Rs. ${totalProjectCost.toLocaleString("en-IN")} (comprising Base Vehicle Cost: Rs. ${bCost.toLocaleString("en-IN")}, Body Building/Accessories: Rs. ${bBuilding.toLocaleString("en-IN")}, and Working Capital: Rs. ${wCapital.toLocaleString("en-IN")}).
         - You MUST detail the Means of Finance exactly:
           * Requested Bank Term Loan: Rs. ${lAmount.toLocaleString("en-IN")} (${loanPct}%)
           * Government/Institutional Capital Subsidy: Rs. ${sub.toLocaleString("en-IN")} (${subsidyPct}%) (Treated as ${treatAsMargin ? "Promoter Margin Contribution" : "Capital Investment/Reserve"})
           * Promoter's Own Margin Money (Self-Equity) Contribution: Rs. ${marginMoney.toLocaleString("en-IN")} (${marginPct}%)
         - CRITICAL: ${treatAsMargin ? `The government subsidy of Rs. ${sub.toLocaleString("en-IN")} directly reduces the required promoter's margin money to Rs. ${marginMoney.toLocaleString("en-IN")}. Explain that this subsidy acts as a powerful catalyst, reducing the promoter's immediate capital requirement.` : `The government subsidy of Rs. ${sub.toLocaleString("en-IN")} is treated as a Capital Investment / Capital Reserve. This means the promoter infuses Rs. ${marginMoney.toLocaleString("en-IN")} in full as margin capital, and the subsidy serves as robust additional project liquidity and cash reserve to support operations.`}
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
      
      FINANCIAL PROJECT DATA:
      - Vehicle Base Cost: Rs. ${bCost.toLocaleString("en-IN")}
      - Body Building / Accessories: Rs. ${bBuilding.toLocaleString("en-IN")}
      - Working Capital Margin: Rs. ${wCapital.toLocaleString("en-IN")}
      - TOTAL PROJECT OUTLAY (COST): Rs. ${totalProjectCost.toLocaleString("en-IN")}
      
      MEANS OF FINANCE:
      - Requested Bank Loan Amount: Rs. ${lAmount.toLocaleString("en-IN")}
      - Government Subsidy: Rs. ${sub.toLocaleString("en-IN")}
      - REQUIRED PROMOTER MARGIN MONEY: Rs. ${marginMoney.toLocaleString("en-IN")}
      - Repayment Period: ${tenureYears || "5"} Years
    `;

    const narrativeHtml = await generateContentWithRetryAndFallback(client, systemPrompt, userPrompt);

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
