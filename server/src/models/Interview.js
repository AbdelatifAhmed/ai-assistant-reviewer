const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const cvDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  skills: [String],
  experience: [
    {
      title: String,
      company: String,
      duration: String,
      description: String,
    },
  ],
  education: [
    {
      degree: String,
      institution: String,
      year: String,
    },
  ],
  projects: [
    {
      name: String,
      description: String,
      technologies: [String],
    },
  ],
  summary: String,
  rawText: String,
});

const feedbackSchema = new mongoose.Schema({
  overallScore: { type: Number, min: 0, max: 100 },
  technicalScore: { type: Number, min: 0, max: 100 },
  communicationScore: { type: Number, min: 0, max: 100 },
  strengths: [String],
  weaknesses: [String],
  improvements: [String],
  detailedAnalysis: String,
  recommendation: {
    type: String,
    enum: ['Strongly Recommend', 'Recommend', 'Neutral', 'Not Recommend'],
  },
  generatedAt: { type: Date, default: Date.now },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    cvData: cvDataSchema,
    cvFileName: String,
    cvFileType: String,
    status: {
      type: String,
      enum: ['uploading', 'parsing', 'active', 'completed', 'failed'],
      default: 'uploading',
    },
    messages: [messageSchema],
    feedback: feedbackSchema,
    duration: Number,
    questionsAsked: { type: Number, default: 0 },
    jobRole: String,
    jobLevel: {
      type: String,
      enum: ['Junior', 'Mid', 'Mid-Level', 'Senior', 'Staff', 'Lead', 'Principal'],
      default: 'Mid',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
