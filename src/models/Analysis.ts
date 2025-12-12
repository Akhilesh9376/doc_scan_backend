import mongoose from "mongoose";

const insightSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
  },
  category: {
    type: String,
    enum: ["strategic", "financial", "legal", "operational", "other"],
  },
  relevanceScore: Number,
});

const analysisSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      unique: true,
      required: true,
    },
    // TODO: GOOGLE GEMINI INTEGRATION
    // ==================================================
    // After implementing Google Gemini:
    // summary: String (AI-generated summary)
    // insights: [insightSchema] (AI-extracted insights)
    // generatedAt: Date
    // geminiBuildVersion: String (for debugging)
    // ==================================================
    summary: {
      type: String,
      default: "",
    },
    insights: [insightSchema],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Analysis = mongoose.model("Analysis", analysisSchema);
