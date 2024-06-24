import faceapi from "face-api.js";
import canvas from "canvas";
import path from "path";
import { __dirname } from "../utils/fileHelper.js"; // Adjust the path as per your project structure
import { deleteUploadedImages } from "../utils/uploadImagesHelper.js";
const { Canvas, Image, ImageData } = canvas;

// Set up environment
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load face detection models
const loadModels = async () => {
  const modelPath = path.join(__dirname, "..", "models");
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
};

// Load models when script starts
loadModels();

// Verify ID function
const verifyID = async (req, res) => {
  const { idImage, selfieImage } = req.files;

  const idImagePath = path.join(
    __dirname,
    "..",
    "uploads",
    idImage[0].filename
  );
  const selfieImagePath = path.join(
    __dirname,
    "..",
    "uploads",
    selfieImage[0].filename
  );

  try {
    // Load images
    const idImageData = await canvas.loadImage(idImagePath);
    const selfieImageData = await canvas.loadImage(selfieImagePath);

    // Detect faces in images
    const idImageDetections = await faceapi
      .detectAllFaces(idImageData)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const selfieImageDetections = await faceapi
      .detectAllFaces(selfieImageData)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (idImageDetections.length === 0 || selfieImageDetections.length === 0) {
      deleteUploadedImages(idImagePath, selfieImagePath);

      return res.status(400).json({
        verified: false,
        message: "Face is not detected in one or both of the images uploaded.",
      });
    }

    // Compare faces using FaceMatcher
    const faceMatcher = new faceapi.FaceMatcher(idImageDetections);
    const bestMatch = faceMatcher.findBestMatch(
      selfieImageDetections[0].descriptor
    );

    if (bestMatch.label === "unknown" || bestMatch.distance >= 0.6) {
      deleteUploadedImages(idImagePath, selfieImagePath);

      return res
        .status(400)
        .json({ verified: false, message: "Face mismatch." });
    }

    // Delete uploaded images
    deleteUploadedImages(idImagePath, selfieImagePath);

    // If everything is okay, return verified status
    res.status(200).json({ verified: true });
  } catch (error) {
    deleteUploadedImages(idImagePath, selfieImagePath);

    console.error("Error in face detection:", error);
    res
      .status(500)
      .json({ verified: false, message: "Error in face detection." });
  }
};

export default verifyID;
