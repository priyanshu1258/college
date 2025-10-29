import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.spreadsheetId = null;
    this.initialized = false;
  }

  async init() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
      if (!this.spreadsheetId)
        throw new Error("GOOGLE_SHEETS_ID environment variable is not set");

      const keyFile = path.join(__dirname, "../service-account-key.json");
      if (!fs.existsSync(keyFile))
        throw new Error("Service account key file not found: " + keyFile);

      const auth = new google.auth.GoogleAuth({
        keyFile,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      this.auth = auth;
      this.sheets = google.sheets({ version: "v4", auth });
      // Probe access (fails fast if the key/sheet share is wrong)
      await this.sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId });

      this.initialized = true;
      console.log(
        "✅ Google Sheets API initialized with Sheet ID:",
        this.spreadsheetId
      );
    } catch (error) {
      console.error("❌ Failed to initialize Google Sheets:", error.message);
      throw error;
    }
  }

  // Check if service is initialized
  isInitialized() {
    return this.initialized && !!this.spreadsheetId && !!this.sheets;
  }

  // Generate Team ID
  generateTeamId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `TEAM-${timestamp}-${random}`.toUpperCase();
  }

  // Append registration with Team ID first (A), Registration ID second (B)
  async appendRegistration(registrationData) {
    try {
      if (!this.isInitialized())
        throw new Error("Google Sheets service not properly initialized");

      const {
        registrationId,
        teamId,
        studentDetails,
        eventSelection,
        participationType,
        teamMembers = [],
        paymentData,
        registeredAt,
      } = registrationData;

      const teamNames = teamMembers
        .map((m) => m.fullName || m.name)
        .filter(Boolean)
        .join(", ");
      const teamEmails = teamMembers
        .map((m) => m.email)
        .filter(Boolean)
        .join(", ");
      const teamPhones = teamMembers
        .map((m) => m.phone)
        .filter(Boolean)
        .join(", ");

      // If a specific esports game was selected, include it in the event name so
      // the Registrations sheet reflects the exact game (e.g. "E-Sports Tournament - BGMI").
      const selectedGame = eventSelection?.selectedEsportsGame;
      const baseEventName = eventSelection?.eventName || "";
      const eventNameWithGame = selectedGame
        ? `${baseEventName} - ${selectedGame}`
        : baseEventName;

      const values = [
        [
          teamId || "",
          registrationId,
          studentDetails.fullName,
          studentDetails.email,
          studentDetails.phone,
          studentDetails.college,
          studentDetails.year,
          studentDetails.department,
          studentDetails.rollNumber,
          eventNameWithGame,
          eventSelection?.category || "",
          eventSelection?.type || "",
          participationType,
          teamMembers.length,
          teamNames,
          teamEmails,
          teamPhones,
          eventSelection?.price,
          paymentData?.method || "upi",
          paymentData?.upiTransactionId || "",
          paymentData?.payerName || "",
          new Date(registeredAt).toLocaleString("en-IN"),
          "Pending Verification",
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "Registrations!A:W",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values },
      });
    } catch (error) {
      console.error(
        "❌ Error appending registration to Google Sheets:",
        error.message
      );
      throw error;
    }
  }

  // Append transaction data to sheet (Team ID in column B)
  async appendTransaction(transactionData) {
    try {
      if (!this.isInitialized())
        throw new Error("Google Sheets service not properly initialized");

      // Transactions (A:M):
      // A Transaction ID, B Team ID, C Registration ID, D Customer Name, E Email,
      // F Event, G Amount, H Currency, I Payment Method, J Status,
      // K Submitted At, L UPI Transaction ID, M Payer Name
      const values = [
        [
          transactionData.transactionId || transactionData.registrationId, // A
          transactionData.teamId || "", // B
          transactionData.registrationId || "", // C
          transactionData.customerInfo?.fullName || "", // D
          transactionData.customerInfo?.email || "", // E
          transactionData.eventId || "", // F
          transactionData.amount ?? "", // G
          transactionData.currency || "INR", // H
          transactionData.paymentMethod || "upi", // I
          transactionData.status || "completed", // J
          new Date(transactionData.submittedAt).toLocaleString("en-IN"), // K
          transactionData.verificationData?.upiTransactionId ||
            transactionData.paymentData?.upiTransactionId ||
            "", // L
          transactionData.verificationData?.payerName ||
            transactionData.paymentData?.payerName ||
            "", // M
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "Transactions!A:M",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values },
      });

      console.log("✅ Transaction added to Google Sheets:", values[0][0]);
      return true;
    } catch (error) {
      console.error(
        "❌ Error appending transaction to Google Sheets:",
        error.message
      );
      throw error;
    }
  }

  // Read full width A:W
  async getRegistrations() {
    const resp = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: "Registrations!A:W",
    });
    return resp.data.values || [];
  }

  // Filter by Team ID in column A (index 0)
  async getRegistrationsByTeamId(teamId) {
    const rows = await this.getRegistrations();
    const TEAM_ID_COL = 0; // column A
    return rows.slice(1).filter((r) => r[TEAM_ID_COL] === teamId);
  }

  // Map indices for A:W with Team ID first
  async getTeamMembers(teamId) {
    try {
      const rows = await this.getRegistrationsByTeamId(teamId);
      return rows.map((r) => ({
        teamId: r[0], // A
        registrationId: r[1], // B
        fullName: r[2], // C
        email: r[3], // D
        phone: r[4], // E
        college: r[5], // F
        year: r[6], // G
        department: r[7], // H
        rollNumber: r[8], // I
        eventName: r[9], // J
        category: r[10], // K
        type: r[11], // L
        participationType: r[12], // M
        teamSize: r[13], // N
        teamNames: r[14], // O
        teamEmails: r[15], // P
        teamPhones: r[16], // Q
        amount: r[17], // R
        paymentMethod: r[18], // S
        upiTransactionId: r[19], // T
        payerName: r[20], // U
        registeredAt: r[21], // V
        status: r[22], // W
      }));
    } catch (error) {
      console.error("❌ Error getting team members:", error.message);
      throw error;
    }
  }

  // Email is column D (3), Event is column J (9), return Team ID at A (0)
  async checkExistingTeam(teamLeaderEmail, eventName) {
    try {
      if (!this.isInitialized()) {
        throw new Error("Google Sheets service not properly initialized");
      }
      const rows = await this.getRegistrations();
      const EMAIL_COL = 3; // D
      const EVENT_COL = 9; // J
      const TEAM_ID_COL = 0; // A

      const existing = rows
        .slice(1)
        .find(
          (r) => r[EMAIL_COL] === teamLeaderEmail && r[EVENT_COL] === eventName
        );
      return existing ? existing[TEAM_ID_COL] : null;
    } catch (error) {
      console.error("❌ Error checking existing team:", error.message);
      throw error;
    }
  }

  // Update team size (N), names (O), emails (P), phones (Q)
  async updateTeamMembers(teamId, newMembers) {
    try {
      if (!this.isInitialized()) {
        throw new Error("Google Sheets service not properly initialized");
      }

      const resp = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "Registrations!A:W",
      });

      const rows = resp.data.values || [];
      const TEAM_ID_COL = 0; // A
      const updates = [];

      const teamSize = newMembers.length;
      const teamNames = newMembers
        .map((m) => m.name || m.fullName)
        .filter(Boolean)
        .join(", ");
      const teamEmails = newMembers
        .map((m) => m.email)
        .filter(Boolean)
        .join(", ");
      const teamPhones = newMembers
        .map((m) => m.phone)
        .filter(Boolean)
        .join(", ");

      rows.forEach((row, idx) => {
        if (row[TEAM_ID_COL] === teamId) {
          const rowNumber = idx + 1; // 1-based (includes header)
          updates.push({
            range: `Registrations!N${rowNumber}:Q${rowNumber}`, // N..Q
            values: [[teamSize, teamNames, teamEmails, teamPhones]],
          });
        }
      });

      if (updates.length > 0) {
        const result = await this.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: { valueInputOption: "RAW", data: updates },
        });
        console.log("✅ Team members updated for team:", teamId);
        return result.data;
      }

      return null;
    } catch (error) {
      console.error("❌ Error updating team members:", error.message);
      throw error;
    }
  }

  // Test connection to Google Sheets
  async testConnection() {
    try {
      if (!this.isInitialized()) {
        throw new Error("Google Sheets service not properly initialized");
      }

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      console.log("✅ Google Sheets connection test successful");
      console.log("Sheet title:", response.data.properties.title);
      return response.data;
    } catch (error) {
      console.error("❌ Google Sheets connection test failed:", error.message);
      throw error;
    }
  }
}

// Create instance but don't auto-initialize
const googleSheetsService = new GoogleSheetsService();

// Export with manual initialization
export default googleSheetsService;
