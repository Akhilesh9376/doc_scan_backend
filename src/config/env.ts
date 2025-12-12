
export const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

// Gemini
export const GEMINI_LLM_MODEL_AI = requireEnv("GEMINI_LLM_MODEL_AI");
export const GOOGLE_GEMINI_API_KEY = requireEnv("GOOGLE_GEMINI_API_KEY");

// Cloudinary (optional: if you want hard-fail when missing)
export const CLOUDINARY_CLOUD_NAME = requireEnv("CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_API_KEY = requireEnv("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = requireEnv("CLOUDINARY_API_SECRET");
