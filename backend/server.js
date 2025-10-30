import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config(); // load .env EARLY

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import googleSheetsService from "./services/googleSheetsService.js";

import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
const initialized = !!process.env.SENDGRID_API_KEY;
if (!initialized) {
  console.warn("⚠️ SendGrid API key not found. OTP emails will not be sent.");
} else {
  console.log("✅ SendGrid OTP Service Initialized");
}

const generateOTPEmailHTML = (otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; }
        .header { background: #8B0000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
        .otp-box { background: #ffffff; padding: 20px; text-align: center; margin: 20px 0; border: 2px dashed #8B0000; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8B0000; margin: 10px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; padding: 10px; border-radius: 4px; border-left: 4px solid #ffc107; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Chaitanya 2025 - OTP Verification</h1>
        <p>Himachal Pradesh Technical University</p>
    </div>
    
    <div class="content">
        <p>Dear Participant,</p>
        
        <p>Your One-Time Password (OTP) for Chaitanya 2025 registration is:</p>
        
        <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p>This OTP is valid for 10 minutes</p>
        </div>

        <div class="warning">
            <strong>⚠️ Security Notice:</strong> Do not share this OTP with anyone.
        </div>

        <p>If you didn't request this OTP, please ignore this email.</p>

        <div class="footer">
            <p><strong>Contact:</strong> chaitanyahptu@gmail.com</p>
            <p>Best regards,<br>
            <strong>Chaitanya 2025 Team</strong><br>
            Himachal Pradesh Technical University</p>
            <div style="font-size: 12px; color: #666; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
                <strong>Event Address:</strong><br>
                Chaitanya 2025, HPTU<br>
                Gandhi Chowk, Hamirpur<br>
                Himachal Pradesh 177001<br>
                <a href="mailto:chaitanyahptu@gmail.com" style="color: #666;">Contact Support</a>
            </div>
        </div>
    </div>
</body>
</html>
`;
};

const sendOTPEmail = async (email, otp) => {
  if (!initialized) {
    console.warn(`📧 [SIMULATED] OTP ${otp} for ${email}`);
    return true; // Return true for testing
  }

  try {
    const msg = {
      to: email,
      from: {
        email: "priyanshuattri05@gmail.com",
        name: "Chaitanya 2025",
      },
      subject: "Your Verification Code for Chaitanya 2025 Registration",
      text: `Your OTP for Chaitanya 2025 registration is: ${otp}. This OTP will expire in 10 minutes.`,
      html: generateOTPEmailHTML(otp),
    };

    await sgMail.send(msg);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ SendGrid error:", error.response?.body || error.message);
    return false;
  }
};

// Load environment variables
dotenv.config();

// ES6 equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
// CORS configuration - allow only known frontends and respond to preflight requests.
// In production, set FRONTEND_URL env var to your deployed frontend (e.g. https://frontend-qrxt.onrender.com)
const allowedOrigins = [
  process.env.FRONTEND_URL, // set this in your Render/hosting env
  "http://localhost:5173",
  "http://localhost:5174",
  // You can add other allowed origins here, for example your deployed frontend:
  "https://frontend-qrxt.onrender.com",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // If no origin (curl, server-to-server), allow it
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Ensure preflight OPTIONS requests are handled and return CORS headers
app.options("*", cors(corsOptions));

// In-memory storage
let transactions = [];
let upiVerifications = [];
let registrations = [];

// Helper functions to save data
const saveTransactions = async () => {
  try {
    await fs.writeFile(
      path.join(__dirname, "data", "transactions.json"),
      JSON.stringify(transactions, null, 2)
    );
  } catch (error) {
    console.error("Error saving transactions:", error);
  }
};

const saveUPIVerifications = async () => {
  try {
    await fs.writeFile(
      path.join(__dirname, "data", "upi-verifications.json"),
      JSON.stringify(upiVerifications, null, 2)
    );
  } catch (error) {
    console.error("Error saving UPI verifications:", error);
  }
};

const saveRegistrations = async () => {
  try {
    await fs.writeFile(
      path.join(__dirname, "data", "registrations.json"),
      JSON.stringify(registrations, null, 2)
    );
  } catch (error) {
    console.error("Error saving registrations:", error);
  }
};

// Ensure data directory exists
const ensureDataDirectory = async () => {
  try {
    await fs.mkdir(path.join(__dirname, "data"), { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
};

// Load data on startup
const loadData = async () => {
  await ensureDataDirectory();

  try {
    const txData = await fs.readFile(
      path.join(__dirname, "data", "transactions.json"),
      "utf8"
    );
    transactions = JSON.parse(txData);
  } catch (error) {
    transactions = [];
    console.log("No existing transactions found, starting fresh...");
  }

  try {
    const upiData = await fs.readFile(
      path.join(__dirname, "data", "upi-verifications.json"),
      "utf8"
    );
    upiVerifications = JSON.parse(upiData);
  } catch (error) {
    upiVerifications = [];
    console.log("No existing UPI verifications found, starting fresh...");
  }

  try {
    const regData = await fs.readFile(
      path.join(__dirname, "data", "registrations.json"),
      "utf8"
    );
    registrations = JSON.parse(regData);
  } catch (error) {
    registrations = [];
    console.log("No existing registrations found, starting fresh...");
  }
};

// Initialize Google Sheets Service
const initializeGoogleSheets = async () => {
  try {
    console.log("🔄 Initializing Google Sheets Service...");
    await googleSheetsService.init();

    // Test connection
    try {
      await googleSheetsService.testConnection();
      console.log("✅ Google Sheets connected successfully");
    } catch (error) {
      console.log(
        "⚠️ Google Sheets connection failed, running in local mode only"
      );
      console.log("   Error:", error.message);
    }
  } catch (error) {
    console.log("❌ Google Sheets initialization failed");
    console.log("   Error:", error.message);
  }
};

// ============================================================================
// COMPLETE REGISTRATION SYSTEM - FIXED DUPLICATION ISSUE
// ============================================================================

// Helper: ID generators
const generateId = (prefix) =>
  `${prefix}${Date.now()}${Math.random()
    .toString(36)
    .substr(2, 5)}`.toUpperCase();

// Helper: Check if registration already exists
const registrationExists = (registrationId) => {
  return registrations.some((reg) => reg.registrationId === registrationId);
};

// Complete registration endpoint - FIXED DUPLICATION
app.post("/api/register", async (req, res) => {
  try {
    const {
      studentDetails,
      eventSelection,
      paymentData,
      participationType = "individual",
      teamMembers = [],
    } = req.body;

    console.log(
      "📨 FULL REGISTRATION DATA RECEIVED:",
      JSON.stringify(
        { studentDetails, eventSelection, participationType },
        null,
        2
      )
    );

    // Validate required data
    if (!studentDetails || !eventSelection) {
      return res.status(400).json({
        success: false,
        error: "Student details and event selection are required",
      });
    }

    // Generate unique registration ID
    const registrationId = generateId("REG");

    // Generate Team ID (only for team participation)
    const teamId = googleSheetsService.generateTeamId();

    // Normalize team members
    const normalizedTeamMembers = (teamMembers || []).map((m, idx) => ({
      ...m,
      teamId,
      memberIndex: idx + 1,
    }));

    // Create registration record - SINGLE SOURCE OF TRUTH
    const registrationRecord = {
      registrationId,
      teamId,
      studentDetails,
      eventSelection,
      participationType,
      teamMembers: normalizedTeamMembers,
      paymentData: paymentData || {},
      status: "registered",
      registeredAt: new Date().toISOString(),
      verified: false,
    };

    // ✅ CHECK FOR DUPLICATION BEFORE SAVING
    if (registrationExists(registrationId)) {
      console.log("❌ Duplicate registration detected:", registrationId);
      return res.status(400).json({
        success: false,
        error: "Duplicate registration detected",
      });
    }

    // ✅ STORE REGISTRATION ONLY ONCE
    registrations.push(registrationRecord);
    await saveRegistrations();

    let sheetsSuccess = false;

    // ✅ ADD TO GOOGLE SHEETS - REGISTRATION
    if (googleSheetsService.isInitialized()) {
      try {
        console.log(
          "➡️  Appending registration to Google Sheets:",
          registrationId
        );
        await googleSheetsService.appendRegistration(registrationRecord);
        sheetsSuccess = true;
        console.log("✅ Registration added to Google Sheets:", registrationId);
      } catch (sheetsError) {
        console.error(
          "❌ Failed to add registration to Google Sheets:",
          sheetsError.message
        );
        sheetsSuccess = false;
      }
    }

    // ✅ CREATE TRANSACTION RECORD ONLY IF PAYMENT DATA EXISTS
    if (paymentData && paymentData.upiTransactionId) {
      const transactionRecord = {
        transactionId: `TX${registrationId.substring(3)}`, // Different ID for transaction
        registrationId,
        teamId,
        amount: eventSelection.price || eventSelection.totalAmount || 0,
        currency: "INR",
        customerInfo: studentDetails,
        eventId: eventSelection.eventId,
        participationType,
        teamMembers: normalizedTeamMembers,
        status: "completed",
        paymentMethod: "upi",
        submittedAt: new Date().toISOString(),
        paymentData,
        upiTransactionId: paymentData.upiTransactionId,
        payerName: paymentData.payerName,
        payerUPI: paymentData.payerUPI,
      };

      // ✅ STORE TRANSACTION ONLY ONCE
      transactions.push(transactionRecord);
      await saveTransactions();

      // ✅ ADD TRANSACTION TO GOOGLE SHEETS
      if (googleSheetsService.isInitialized() && sheetsSuccess) {
        try {
          await googleSheetsService.appendTransaction(transactionRecord);
          console.log(
            "✅ Transaction added to Google Sheets:",
            transactionRecord.transactionId
          );
        } catch (sheetsError) {
          console.error(
            "❌ Failed to add transaction to Google Sheets:",
            sheetsError.message
          );
        }
      }
    }

    // ✅ SINGLE RESPONSE - NO DUPLICATION
    const responseData = {
      success: true,
      registrationId,
      teamId,
      message: sheetsSuccess
        ? "Registration completed successfully!"
        : "Registration completed successfully! (Saved locally)",
      registration: {
        id: registrationId,
        teamId,
        studentName: studentDetails.fullName,
        event:
          eventSelection.eventName ||
          eventSelection.selectedEventsData?.[0]?.name ||
          "Multiple Events",
        amount: eventSelection.price || eventSelection.totalAmount || 0,
        status: "registered",
      },
    };

    res.json(responseData);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed: " + error.message,
    });
  }
});

// Add this endpoint to sync existing data to Google Sheets
app.post("/api/admin/sync-to-sheets", async (req, res) => {
  try {
    if (!googleSheetsService.isInitialized()) {
      return res.status(500).json({
        success: false,
        error: "Google Sheets service not available",
      });
    }

    let syncedCount = 0;

    // Sync registrations
    for (const registration of registrations) {
      try {
        await googleSheetsService.appendRegistration(registration);
        syncedCount++;
        console.log(`✅ Synced registration: ${registration.registrationId}`);
      } catch (error) {
        console.error(
          `❌ Failed to sync registration ${registration.registrationId}:`,
          error.message
        );
      }
    }

    // Sync transactions
    for (const transaction of transactions) {
      try {
        await googleSheetsService.appendTransaction(transaction);
        syncedCount++;
        console.log(`✅ Synced transaction: ${transaction.transactionId}`);
      } catch (error) {
        console.error(
          `❌ Failed to sync transaction ${transaction.transactionId}:`,
          error.message
        );
      }
    }

    res.json({
      success: true,
      message: `Successfully synced ${syncedCount} records to Google Sheets`,
    });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({
      success: false,
      error: "Sync failed: " + error.message,
    });
  }
});

// Get registration by ID
app.get("/api/registration/:registrationId", async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = registrations.find(
      (reg) => reg.registrationId === registrationId
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: "Registration not found",
      });
    }

    res.json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error("Error fetching registration:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch registration",
    });
  }
});

// Get all registrations (admin)
app.get("/api/admin/registrations", async (req, res) => {
  try {
    const { status, event, page = 1, limit = 50 } = req.query;

    let filteredRegistrations = registrations;

    if (status) {
      filteredRegistrations = filteredRegistrations.filter(
        (reg) => reg.status === status
      );
    }

    if (event) {
      filteredRegistrations = filteredRegistrations.filter(
        (reg) => reg.eventSelection.eventId === event
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedRegistrations = filteredRegistrations.slice(
      startIndex,
      endIndex
    );

    res.json({
      success: true,
      registrations: paginatedRegistrations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredRegistrations.length,
        totalPages: Math.ceil(filteredRegistrations.length / limit),
      },
      stats: {
        total: registrations.length,
        individual: registrations.filter(
          (reg) => reg.participationType === "individual"
        ).length,
        team: registrations.filter((reg) => reg.participationType === "team")
          .length,
        byEvent: getRegistrationsByEvent(registrations),
      },
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch registrations",
    });
  }
});

// ============================================================================
// OTP ENDPOINTS - FIXED VERSION
// ============================================================================

// Store OTPs with email as key and expiration
let otpStore = new Map();

// Generate and send OTP
app.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    console.log(`📧 OTP for ${email}: ${otp}`); // Remove in production

    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: "Failed to send OTP email",
      });
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      // For development only - remove in production
      developmentOTP: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
});

// Verify OTP - FIXED VERSION
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp: submittedOTP } = req.body;

    console.log("📨 OTP Verification Request:", { email, submittedOTP });

    if (!email || !submittedOTP) {
      return res.status(400).json({
        success: false,
        error: "Email and OTP are required",
      });
    }

    // Get stored OTP data
    const storedData = otpStore.get(email);

    if (!storedData) {
      console.log("❌ No OTP found for email:", email);
      return res.status(400).json({
        success: false,
        error: "OTP not found or expired. Please request a new OTP.",
      });
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email); // Clean up expired OTP
      console.log("❌ OTP expired for email:", email);
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (storedData.otp === submittedOTP) {
      // Remove OTP after successful verification
      otpStore.delete(email);
      console.log("✅ OTP verified successfully for:", email);

      res.json({
        success: true,
        message: "OTP verified successfully",
      });
    } else {
      console.log(
        "❌ Invalid OTP for email:",
        email,
        "Expected:",
        storedData.otp,
        "Received:",
        submittedOTP
      );
      res.status(400).json({
        success: false,
        error: "Invalid OTP",
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify OTP",
    });
  }
});

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// ============================================================================
// EVENT MANAGEMENT - UPDATED TO MATCH FRONTEND
// ============================================================================

app.get("/api/events", (req, res) => {
  try {
    const { participationType = "individual" } = req.query;

    // Team events (matches your frontend exactly)
    const teamEvents = [
      {
        id: "hackathon",
        name: "Hackathon (Code Forge)",
        description: "36-hour coding competition to build innovative solutions",
        price: 199,
        duration: "36 Hours",
        category: "Technical",
        type: "team",
        maxParticipants: 4,
      },
      {
        id: "datathon",
        name: "Datathon",
        description: "Data analysis and machine learning competition",
        price: 199,
        duration: "24 Hours",
        category: "Technical",
        type: "team",
        maxParticipants: 4,
      },
      {
        id: "polymath",
        name: "PolyMath (Escape Room)",
        description: "Solve puzzles and escape the room challenge",
        price: 149,
        duration: "4 Hours",
        category: "Technical",
        type: "team",
        maxParticipants: 4,
      },
      {
        id: "esports",
        name: "E-Sports Tournament",
        description: "Competitive gaming tournament",
        price: 149,
        duration: "1 Day",
        category: "Esports",
        type: "team",
        maxParticipants: 4,
        requiresGameSelection: true,
      },
      {
        id: "debate",
        name: "Debate Competition",
        description: "Argumentation and public speaking challenge",
        price: 99,
        duration: "3 Hours",
        category: "Cultural",
        type: "team",
        maxParticipants: 2,
      },
      {
        id: "project-bazaar",
        name: "Project Bazaar",
        description: "Showcase your innovative projects",
        price: 0,
        duration: "6 Hours",
        category: "Technical",
        type: "team",
        maxParticipants: 4,
      },
      {
        id: "ctf",
        name: "CTF - Capture The Flag",
        description:
          "Cybersecurity challenge with hacking and problem-solving tasks",
        price: 0,
        duration: "6 Hours",
        category: "Technical",
        type: "team",
        maxParticipants: 4,
      },
    ];

    // Individual events (matches your frontend exactly)
    const individualEvents = [
      {
        id: "retro-theming",
        name: "Retro Theming",
        description: "Creative design competition with retro themes",
        price: 99,
        duration: "3 Hours",
        category: "Creative",
        type: "individual",
      },
      {
        id: "prompt-engineering",
        name: "Prompt Engineering",
        description: "Master the art of AI prompt crafting",
        price: 99,
        duration: "2 Hours",
        category: "Technical",
        type: "individual",
      },
      {
        id: "integration-bee",
        name: "Integration Bee",
        description: "Mathematical integration competition",
        price: 99,
        duration: "3 Hours",
        category: "Technical",
        type: "individual",
      },
      {
        id: "human-vs-ai",
        name: "Human vs AI",
        description: "Test your skills against artificial intelligence",
        price: 99,
        duration: "2 Hours",
        category: "Technical",
        type: "individual",
      },
      {
        id: "reverse-engineering",
        name: "Reverse Engineering",
        description: "Deconstruct and understand complex systems",
        price: 99,
        duration: "3 Hours",
        category: "Technical",
        type: "individual",
      },
      // FIXED: separate items
      {
        id: "jack-of-hearts",
        name: "Jack of Hearts",
        description: "Card game strategy competition",
        price: 99,
        duration: "2 Hours",
        category: "Gaming",
        type: "individual",
      },
      {
        id: "singing",
        name: "Singing Competition",
        description: "Showcase your vocal talent",
        price: 99,
        duration: "2 Hours",
        category: "Cultural",
        type: "individual",
      },
      {
        id: "dancing",
        name: "Dancing Competition",
        description: "Show your dance moves and creativity",
        price: 99,
        duration: "3 Hours",
        category: "Cultural",
        type: "individual",
      },
    ];

    const events = participationType === "team" ? teamEvents : individualEvents;

    res.json({
      success: true,
      events: events,
      foodPrice: 199,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch events",
    });
  }
});

// Updated calculate amount endpoint to match frontend pricing
app.post("/api/calculate-amount", (req, res) => {
  try {
    const {
      selectedEvents,
      participationType,
      teamMembersCount = 1,
      includeFood = true,
    } = req.body;

    if (!selectedEvents || !Array.isArray(selectedEvents)) {
      return res.status(400).json({
        success: false,
        error: "Selected events array is required",
      });
    }

    let eventTotal = 0;
    const totalParticipants =
      participationType === "team" ? teamMembersCount + 1 : 1;

    // Event pricing matches frontend exactly
    const events = {
      // Team events
      hackathon: { price: 199, type: "team" },
      datathon: { price: 199, type: "team" },
      polymath: { price: 149, type: "team" },
      esports: { price: 149, type: "team" },
      debate: { price: 99, type: "team" },
      "project-bazaar": { price: 0, type: "team" },

      // Individual events
      "retro-theming": { price: 99, type: "individual" },
      "prompt-engineering": { price: 99, type: "individual" },
      "integration-bee": { price: 99, type: "individual" },
      "human-vs-ai": { price: 99, type: "individual" },
      "reverse-engineering": { price: 99, type: "individual" },
      "jack-of-hearts": { price: 99, type: "individual" },
      singing: { price: 99, type: "individual" },
      dancing: { price: 99, type: "individual" },
    };

    selectedEvents.forEach((eventId) => {
      const event = events[eventId];
      if (event) {
        if (event.type === "team") {
          eventTotal += event.price * totalParticipants;
        } else {
          eventTotal += event.price;
        }
      }
    });

    const foodTotal = includeFood ? 199 * totalParticipants : 0;
    const totalAmount = eventTotal + foodTotal;

    res.json({
      success: true,
      totalAmount: totalAmount,
      breakdown: {
        eventFees: eventTotal,
        foodCharges: foodTotal,
        foodCount: includeFood ? totalParticipants : 0,
        participantCount: totalParticipants,
      },
    });
  } catch (error) {
    console.error("Error calculating amount:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate amount",
    });
  }
});

// ============================================================================
// PAYMENT ENDPOINTS
// ============================================================================

app.post("/api/verify-upi-payment", async (req, res) => {
  try {
    const { upiTransactionId, payerName, payerUPI, transactionData } = req.body;

    if (!upiTransactionId || !payerName) {
      return res.status(400).json({
        success: false,
        error: "UPI Transaction ID and Payer Name are required",
      });
    }

    const existingVerification = upiVerifications.find(
      (v) => v.upiTransactionId === upiTransactionId
    );

    if (existingVerification) {
      return res.status(400).json({
        success: false,
        error: "This UPI Transaction ID has already been submitted",
      });
    }

    const verificationId = `CHAITANYA${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 5)}`.toUpperCase();

    const verificationRecord = {
      verificationId,
      upiTransactionId,
      payerName,
      payerUPI: payerUPI || "",
      amount: transactionData?.amount,
      eventName: transactionData?.event,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    upiVerifications.push(verificationRecord);
    await saveUPIVerifications();

    res.json({
      success: true,
      verificationId,
      message: "Payment verification submitted successfully.",
    });
  } catch (error) {
    console.error("Error processing UPI verification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process verification",
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRegistrationsByEvent(registrations) {
  const eventCounts = {};
  registrations.forEach((reg) => {
    const eventId = reg.eventSelection.eventId;
    eventCounts[eventId] = (eventCounts[eventId] || 0) + 1;
  });

  return Object.entries(eventCounts).map(([eventId, count]) => ({
    eventId,
    eventName: getEventName(eventId),
    registrations: count,
  }));
}

function getEventName(eventId) {
  const events = {
    hackathon: "Hackathon (Code Forge)",
    datathon: "Datathon",
    polymath: "PolyMath (Escape Room)",
    esports: "E-Sports Tournament",
    debate: "Debate Competition",
    "project-bazaar": "Project Bazaar",
    "retro-theming": "Retro Theming",
    "prompt-engineering": "Prompt Engineering",
    "integration-bee": "Integration Bee",
    "human-vs-ai": "Human vs AI",
    "reverse-engineering": "Reverse Engineering",
    "jack-of-hearts": "Jack of Hearts",
    singing: "Singing Competition",
    dancing: "Dancing Competition",
  };
  return events[eventId] || eventId;
}

// ============================================================================
// BASIC ROUTES
// ============================================================================

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Chaitanya 2025 Server is running",
    timestamp: new Date().toISOString(),
    stats: {
      registrations: registrations.length,
      transactions: transactions.length,
      verifications: upiVerifications.length,
    },
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Load data and start server
const startServer = async () => {
  await loadData();
  await initializeGoogleSheets(); // keep this before listen()

  app.listen(PORT, () => {
    console.log(`🚀 Chaitanya 2025 Server running on port ${PORT}`);
  });
};

startServer().catch(console.error);

export default app;
