import { createPartFromUri, createUserContent } from "@google/genai";
import { getGeminiClient, GEMINI_LLM_MODEL_AI } from "../config/gemini.js";
import { uploadDocumentBufferToGemini } from "./geminiFile.service.js";
import { Insight } from "../types/api.js";
import { generateMockInsights, generateMockSummary } from "../utils/mockData.js";
import { extractOfficeTextFromBuffer, OFFICE_MIME_TYPES } from "./officeToText.service.js";

export async function generateAISummaryFromBuffer(
    buffer: Buffer,
    mimeType: string,
    fileName: string
): Promise<string> {
    console.log("[GEMINI] Starting generateAISummary with buffer content");
    const ai = getGeminiClient();
    if (OFFICE_MIME_TYPES.has(mimeType)) {
        console.log("[GEMINI] Office file detected, extracting text via office-text-extractor...");

        const text = await extractOfficeTextFromBuffer(buffer);

        const contents = [
            createUserContent([
                `You are a document analysis assistant. Summarize this Office document in 2–3 sentences. Identify the document type and main subject.\n\nDocument content:\n${text}`,
            ]),
        ];

        const response = await ai.models.generateContent({
            model: GEMINI_LLM_MODEL_AI,
            contents,
        });

        console.log("[GEMINI] Summary generated from Office text.");
        return response.text || "Unable to generate summary.";
    }

    const geminiFile = await uploadDocumentBufferToGemini(
        buffer,
        mimeType,
        fileName
    );

    const contents = [
        createUserContent([
            "Summarize this document in 2–3 sentences. Identify the document type and main subject.",
            createPartFromUri(geminiFile.uri, geminiFile.mimeType),
        ]),
    ];

    const response = await ai.models.generateContent({
        model: GEMINI_LLM_MODEL_AI,
        contents,
    });

    console.log("[GEMINI] Summary generated.");
    return response.text || "Unable to generate summary.";
}

export async function generateAIInsightsFromBuffer(
    buffer: Buffer,
    mimeType: string,
    fileName: string
): Promise<Insight[]> {
    console.log("[GEMINI] Starting generateAIInsights with buffer content");

    const ai = getGeminiClient();
    const geminiFile = await uploadDocumentBufferToGemini(
        buffer,
        mimeType,
        fileName
    );

    const prompt = `Extract 5 key insights from this document and return only a valid JSON array:
[{
  "id": "insight-1",
  "title": "",
  "description": "",
  "priority": "high",
  "category": "strategic",
  "relevanceScore": 0.9
}]`;

    const contents = [
        createUserContent([
            prompt,
            createPartFromUri(geminiFile.uri, geminiFile.mimeType),
        ]),
    ];

    const response = await ai.models.generateContent({
        model: GEMINI_LLM_MODEL_AI,
        contents,
    });

    console.log("[GEMINI] Insights response received.");
    const text = response.text || "";

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        console.error("[GEMINI] Could not extract JSON from response:", text);
        return [];
    }

    try {
        const insights = JSON.parse(jsonMatch[0]);
        return Array.isArray(insights) ? insights : [];
    } catch (err) {
        console.error("[GEMINI] JSON parse error for insights:", err);
        return [];
    }
}

export { generateMockSummary, generateMockInsights };
