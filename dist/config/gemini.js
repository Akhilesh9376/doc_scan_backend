import { GoogleGenAI } from "@google/genai";
import { GOOGLE_GEMINI_API_KEY, GEMINI_LLM_MODEL_AI } from "./env.js";
export const getGeminiClient = () => {
    return new GoogleGenAI({ apiKey: GOOGLE_GEMINI_API_KEY });
};
export { GEMINI_LLM_MODEL_AI };
//# sourceMappingURL=gemini.js.map