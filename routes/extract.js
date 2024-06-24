import canvas from "canvas";
import path from "path";
import Tesseract from "tesseract.js";
import { __dirname } from "../utils/fileHelper.js";

const { Canvas, Image, ImageData } = canvas;

const extractData = async (req, res) => {
  const { idImage } = req.files;

  const idImagePath = path.join(
    __dirname,
    "..",
    "uploads",
    idImage[0].filename
  );

  try {
    await canvas.loadImage(idImagePath);

    // Perform OCR on the ID image
    const ocrResult = await Tesseract.recognize(idImagePath, "eng");
    const extractedText = ocrResult.data.text;

    // Parse the extracted text for ID information
    const lines = extractedText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    let licenseNo = "";
    let expirationDate = "";

    // Use a simple state machine to capture the values below the specific keywords
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes("license no.")) {
        if (i + 1 < lines.length) {
          licenseNo = lines[i + 1];
        }
      }
      if (lines[i].toLowerCase().includes("expiration date")) {
        if (i + 1 < lines.length) {
          expirationDate = lines[i + 1];
        }
      }
    }

    licenseNo = expirationDate.split(" ")[0];
    expirationDate = expirationDate.split(" ")[1];

    console.log(licenseNo);

    const idInfo = {
      image: `${req.protocol}://${req.get("host")}/uploads/${
        idImage[0].filename
      }`,
      licenseNo,
      expirationDate,
    };

    res.status(200).json({ verified: true, idInfo });
  } catch (error) {
    console.error("Error in text extraction:", error);
    res
      .status(500)
      .json({ verified: false, message: "Error in text extraction." });
  }
};

export default extractData;
