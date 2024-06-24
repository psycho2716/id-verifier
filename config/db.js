import mongoose from "mongoose";

const database = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected:", conn.connection.host);
  } catch (error) {
    console.log("Database Error:", error);
  }
};

export default database;
