// import express from "express";
// import cors from "cors";
// import axios from "axios";

// const app = express();
// const MONO_SECRET_KEY = "test_sk_k3twxvjgtqcw52tegy1f";
// const MONO_API_URL = "https://api.withmono.com/v2/";

// app.use(cors());
// app.use(express.json());

// app.post("/api/auth", async (req, res) => {
//   try {
//     const { code } = req.body;

//     // Exchange code for account id
//     const authResponse = await axios.post(
//       `https://api.withmono.com/v2/accounts/auth`,
//       { code },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "mono-sec-key": MONO_SECRET_KEY,
//         },
//       }
//     );

//     const accountId = authResponse.data.id;

//     // Get account details
//     const accountResponse = await axios.get(
//       `${MONO_API_URL}/accounts/${accountId}`,
//       {
//         headers: {
//           "mono-sec-key": MONO_SECRET_KEY,
//         },
//       }
//     );

//     // Get account balance
//     const balanceResponse = await axios.get(
//       `${MONO_API_URL}/accounts/${accountId}/balance`,
//       {
//         headers: {
//           "mono-sec-key": MONO_SECRET_KEY,
//         },
//       }
//     );

//     res.json({
//       account: accountResponse.data,
//       balance: balanceResponse.data,
//     });
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({
//       error: "Failed to fetch account information",
//       details: error.response?.data || error.message,
//     });
//   }
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from "express";
import cors from "cors";
import { Mono } from "mono-node";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Mono client
const monoClient = new Mono({
  secretKey: "test_sk_k3twxvjgtqcw52tegy1f",
});

app.post("/api/auth", async (req, res) => {
  const { code } = req.body;
  console.log(code);
  // Get account ID from auth code
  monoClient.auth.getAccountId({ code }, (authErr, authResult) => {
    if (authErr) {
      return res.status(500).json({
        error: "Authentication failed",
        details: authErr,
      });
    }

    const accountId = authResult.id;

    // Get account information
    monoClient.account.getAccountInformation(
      { accountId },
      (infoErr, accountInfo) => {
        if (infoErr) {
          return res.status(500).json({
            error: "Failed to fetch account information",
            details: infoErr,
          });
        }

        // Check if data is ready
        if (accountInfo.meta.data_status !== "AVAILABLE") {
          return res.json({
            status: "processing",
            message: "Account data is still being processed",
          });
        }

        // Get balance information
        monoClient.account.getAccountInformation(
          { accountId },
          (balanceErr, balanceInfo) => {
            if (balanceErr) {
              return res.status(500).json({
                error: "Failed to fetch balance",
                details: balanceErr,
              });
            }

            // Return combined information
            res.json({
              account: accountInfo,
              balance: balanceInfo,
            });
          }
        );
      }
    );
  });
});

// Optional: Endpoint to get transactions
app.get("/api/transactions/:accountId", (req, res) => {
  const { accountId } = req.params;

  monoClient.account.getAccountTransactions({ accountId }, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Failed to fetch transactions",
        details: err,
      });
    }
    res.json(results);
  });
});

// Optional: Endpoint to unlink account
app.post("/api/unlink/:accountId", (req, res) => {
  const { accountId } = req.params;

  monoClient.account.unlinkAccount({ accountId }, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: "Failed to unlink account",
        details: err,
      });
    }
    res.json(results);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
