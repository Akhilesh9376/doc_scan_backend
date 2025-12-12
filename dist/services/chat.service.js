import { createPartFromUri, createUserContent } from "@google/genai";
import { getGeminiClient, GEMINI_LLM_MODEL_AI } from "../config/gemini.js";
import { uploadDocumentBufferToGemini } from "./geminiFile.service.js";
import { generateMockResponse } from "../utils/mockData.js";
export async function generateAIChatResponse(document, userMessage, buffer) {
    if (!buffer) {
        console.warn("[GEMINI CHAT] No buffer found for document. Using mock response.");
        return generateMockResponse(userMessage);
    }
    try {
        const ai = getGeminiClient();
        const geminiFile = await uploadDocumentBufferToGemini(buffer, document.type, document.name);
        const contents = [
            createUserContent([
                "You are a helpful assistant. Answer the question using ONLY the content of this document.",
                createPartFromUri(geminiFile.uri, geminiFile.mimeType),
                `User question: ${userMessage}`,
            ]),
        ];
        const response = await ai.models.generateContent({
            model: GEMINI_LLM_MODEL_AI,
            contents,
        });
        console.log("[GEMINI CHAT] Response received from Gemini.");
        return (response.text || "I am unable to answer based on the document.");
    }
    catch (error) {
        console.error("[GEMINI CHAT ERROR] generateAIChatResponse failed:", error);
        return "I'm sorry, I was unable to process your request due to an error.";
    }
}
//# sourceMappingURL=chat.service.js.map