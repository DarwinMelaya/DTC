const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/adminModel");
const adminRouter = require("./routes/adminRoutes");
const documentRouter = require("./routes/documentsRoutes");
const agencyRouter = require("./routes/agencyRoutes");
const receiverRouter = require("./routes/receiverNameRoutes");
const { ensureNetworkShare, NETWORK_SHARE_PATH } = require("./controllers/googleDrive");
dotenv.config();
const app = express();
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 5000;

const ensureDefaultAdmin = async () => {
  try {
    const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";
    const password = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return;

    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ email, password: hashedPassword });
    console.log(`Seeded default admin account (${email}).`);
  } catch (error) {
    console.error("Failed to seed default admin:", error.message);
  }
};

app.use(cors());
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/DocumentTrackingSystem", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB locally");
    await ensureDefaultAdmin();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/admin", adminRouter);
app.use("/api/document", documentRouter);
app.use("/api/agency", agencyRouter);
app.use("/api/receiver", receiverRouter);

ensureNetworkShare()
  .then(() => console.log(`Network share available at ${NETWORK_SHARE_PATH}`))
  .catch((error) =>
    console.error("Failed to initialize network share:", error.message)
  );

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
