// Function to delete uploaded images
import fs from "fs";

export const deleteUploadedImages = (idImagePath, selfieImagePath) => {
  try {
    fs.unlinkSync(idImagePath); // Delete ID image
    fs.unlinkSync(selfieImagePath); // Delete selfie image
    console.log("Uploaded images deleted successfully.");
  } catch (err) {
    console.error("Error deleting uploaded images:", err);
  }
};