import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import verifyID from "./routes/verify.js"; // Assuming this is for handling verification logic
import database from "./config/db.js";
import dotenv from "dotenv";
import extractData from "./routes/extract.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Multer instance for handling file uploads
const upload = multer({ storage });

// Route handler for file upload
app.post(
  "/api/verify",
  upload.fields([{ name: "idImage" }, { name: "selfieImage" }]),
  async (req, res) => {
    await verifyID(req, res); // Pass req and res to the verification function
  }
);

app.post(
  "/api/extract-data",
  upload.fields([{ name: "idImage" }]),
  async (req, res) => {
    await extractData(req, res); // Pass req and res to the verification function
  }
);

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
