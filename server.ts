import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import morgan from "morgan";
import Parser from "rss-parser";

// In-memory store for 2FA codes (in a real app, use Redis or a database)
const twoFactorCodes = new Map<string, { code: string; expires: number }>();

async function send2FAToGoogleDoc(accessToken: string, code: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });

  // 1. Search for the document
  const response = await drive.files.list({
    q: "name='Codes for 2FA' and mimeType='application/vnd.google-apps.document' and trashed=false",
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  let documentId: string;

  if (response.data.files && response.data.files.length > 0) {
    documentId = response.data.files[0].id!;
  } else {
    // 2. Create if not found
    const createResponse = await docs.documents.create({
      requestBody: {
        title: 'Codes for 2FA',
      },
    });
    documentId = createResponse.data.documentId!;
  }

  // 3. Clear document and insert code
  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          deleteContentRange: {
            range: {
              startIndex: 1,
              endIndex: 2, // This is a bit tricky, docs need at least one character
            },
          },
        },
        {
          insertText: {
            location: { index: 1 },
            text: `Your Formula 1 Tracker Admin 2FA code is: ${code}\nGenerated at: ${new Date().toLocaleString()}`,
          },
        },
      ],
    },
  });

  return documentId;
}

async function startServer() {
  const app = express();

  // Basic security middleware
  app.use(morgan('dev'));
  
  if (process.env.NODE_ENV === "production") {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https://*", "http://*"],
          connectSrc: ["'self'", "https://*", "wss://*"],
        },
      },
    }));
  } else {
    app.use(helmet({
      contentSecurityPolicy: false,
    }));
  }

  // CORS configuration
  app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  const PORT = 3000;

  // Rate Limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  });

  const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many API requests, please slow down',
  });

  // Apply general rate limiting to all requests
  app.use(generalLimiter);
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(hpp());

  // API routes FIRST
  app.post("/api/admin/login", apiLimiter, async (req, res) => {
    const { password, googleToken } = req.body;
    
    if (password !== "Piastri") {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "ajones29@erc.nsw.edu.au";

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    twoFactorCodes.set(adminEmail, { code, expires });
    console.log(`[DEV] Generated 2FA code for ${adminEmail}: ${code}`);

    let documentId: string | undefined;

    if (googleToken) {
      try {
        documentId = await send2FAToGoogleDoc(googleToken, code);
        console.log(`Sent 2FA code to Google Doc for ${adminEmail}`);
      } catch (error) {
        console.error("Failed to send 2FA to Google Doc:", error);
      }
    } else {
      console.log("No googleToken provided, could not send to Google Doc.");
    }

    res.json({ success: true, require2FA: true, email: adminEmail, documentId });
  });

  app.post("/api/admin/verify", apiLimiter, async (req, res) => {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const storedData = twoFactorCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ error: "No 2FA code requested" });
    }
    
    if (Date.now() > storedData.expires) {
      twoFactorCodes.delete(email);
      return res.status(400).json({ error: "Code expired" });
    }
    
    if (storedData.code !== code) {
      return res.status(401).json({ error: "Invalid code" });
    }
    
    twoFactorCodes.delete(email);
    res.json({ success: true, token: "admin_token_" + Date.now() });
  });

  app.post("/api/predict", apiLimiter, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a highly knowledgeable Formula 1 strategist and data analyst. You can predict race results, provide strategies, and offer insightful F1 information based on current and historical data. Be clear, concise, and professional. Format responses with markdown."
        }
      });
      res.json({ result: response.text });
    } catch (error) {
      console.error("AI Prediction Error:", error);
      res.status(500).json({ error: "Failed to generate prediction" });
    }
  });

  app.get("/api/f1-news", async (req, res) => {
    const feeds = [
      'https://feeds.bbci.co.uk/sport/formula1/rss.xml',
      'https://www.skysports.com/rss/12433'
    ];
    const parser = new Parser({
      timeout: 6000,
      customFields: {
        item: ['enclosure']
      }
    });

    for (const feedUrl of feeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        if (feed && feed.items && feed.items.length > 0) {
          return res.json(feed.items);
        }
      } catch (err) {
        // Silently continue to the next feed if one fails
      }
    }

    // Fallback news items if external RSS feeds are unreachable
    return res.json([
      {
        title: "2026 Formula 1 Technical Regulations & Season Preview",
        link: "https://www.formula1.com/en/latest",
        pubDate: new Date().toISOString(),
        contentSnippet: "Stay up to date with the latest stories, team developments, driver standings, and technical insights directly from the paddock."
      }
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
