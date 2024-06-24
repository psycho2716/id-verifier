import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  idImagePath: String,
  selfieImagePath: String,
  verified: Boolean,
  extractedText: String,
});

module.exports = mongoose.model('User', userSchema);
