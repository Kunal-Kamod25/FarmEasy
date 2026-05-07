// ===========================================================================
// GST VERIFICATION CONTROLLER
// Uses Cashfree Verification API to validate vendor GSTIN numbers
// API keys are kept server-side only — never exposed to the frontend
// ===========================================================================

const axios = require("axios");
const db = require("../config/db");

// GSTIN format: 2-digit state code + 10-char PAN + 1 entity code + Z + 1 check digit
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Get the Cashfree base URL based on environment
 */
function getCashfreeBaseUrl() {
  const env = (process.env.CASHFREE_ENV || "sandbox").toLowerCase();
  return env === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";
}

// ===========================================================================
// VERIFY GST NUMBER
// POST /api/vendor/verify-gst
// Body: { gstin: "22AAAAA0000A1Z5" }
// ===========================================================================
exports.verifyGST = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gstin } = req.body;

    // ── 1. Validate input ──
    if (!gstin || typeof gstin !== "string") {
      return res.status(400).json({
        success: false,
        message: "GST number is required.",
      });
    }

    const cleanGstin = gstin.trim().toUpperCase();

    if (!GSTIN_REGEX.test(cleanGstin)) {
      return res.status(400).json({
        success: false,
        message: "Invalid GSTIN format. It should be 15 characters like 22AAAAA0000A1Z5.",
      });
    }

    // ── 2. Check if this vendor already has a verified GST ──
    const [sellerRows] = await db.query(
      "SELECT id, gst_verified, gst_no FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!sellerRows.length) {
      return res.status(404).json({
        success: false,
        message: "Seller record not found. Please complete your vendor profile first.",
      });
    }

    const seller = sellerRows[0];

    // If already verified with the same GSTIN, don't call API again
    if (seller.gst_verified && seller.gst_no === cleanGstin) {
      return res.json({
        success: true,
        message: "GST is already verified.",
        already_verified: true,
      });
    }

    // ── 3. Check Cashfree credentials ──
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("❌ Cashfree credentials not configured in .env");
      return res.status(500).json({
        success: false,
        message: "GST verification service is not configured. Please contact support.",
      });
    }

    // ── 4. Call Cashfree Verification API ──
    const baseUrl = getCashfreeBaseUrl();
    let cashfreeResponse;

    try {
      cashfreeResponse = await axios.post(
        `${baseUrl}/verification/gstin`,
        { gstin: cleanGstin },
        {
          headers: {
            "x-client-id": clientId,
            "x-client-secret": clientSecret,
            "Content-Type": "application/json",
          },
          timeout: 15000, // 15 second timeout
        }
      );
    } catch (apiError) {
      console.error("Cashfree API Error:", apiError.response?.data || apiError.message);

      const status = apiError.response?.status;
      const errorData = apiError.response?.data;

      if (status === 422 || status === 400) {
        return res.status(400).json({
          success: false,
          message: errorData?.message || "Invalid GSTIN. Please check the number and try again.",
        });
      }

      if (status === 401 || status === 403) {
        return res.status(500).json({
          success: false,
          message: "GST verification service authentication failed. Please contact support.",
        });
      }

      return res.status(502).json({
        success: false,
        message: "GST verification service is temporarily unavailable. Please try again later.",
      });
    }

    // ── 5. Process the response ──
    const data = cashfreeResponse.data;

    // Cashfree returns: legal_name, trade_name, status, taxpayer_type, registration_date, etc.
    const legalName = data.legal_name || data.lgnm || null;
    const tradeName = data.trade_name || data.tradeNam || null;
    const gstStatus = data.status || data.sts || null;

    // Only mark as verified if GST status is "Active"
    const isActive = gstStatus && gstStatus.toLowerCase() === "active";

    // ── 6. Update the seller record ──
    await db.query(
      `UPDATE seller 
       SET 
         gst_no = ?,
         gst_verified = ?,
         gst_legal_name = ?,
         gst_trade_name = ?,
         gst_status = ?,
         gst_verified_at = NOW()
       WHERE user_id = ?`,
      [
        cleanGstin,
        isActive ? 1 : 0,
        legalName,
        tradeName,
        gstStatus,
        userId,
      ]
    );

    // ── 7. Return result ──
    if (isActive) {
      return res.json({
        success: true,
        verified: true,
        message: "GST verified successfully!",
        data: {
          gstin: cleanGstin,
          legal_name: legalName,
          trade_name: tradeName,
          status: gstStatus,
          verified_at: new Date().toISOString(),
        },
      });
    } else {
      return res.json({
        success: false,
        verified: false,
        message: `GST number is valid but status is "${gstStatus}". Only Active GSTINs can be verified.`,
        data: {
          gstin: cleanGstin,
          legal_name: legalName,
          trade_name: tradeName,
          status: gstStatus,
        },
      });
    }
  } catch (error) {
    console.error("GST Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during GST verification.",
    });
  }
};
