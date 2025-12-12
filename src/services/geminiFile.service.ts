import { getGeminiClient } from "../config/gemini.js";

export async function uploadDocumentBufferToGemini(
  buffer: Buffer,
  mimeType: string,
  displayName: string
): Promise<{ uri: string; mimeType: string }> {
  const ai = getGeminiClient();

  console.log("[GEMINI UPLOAD] Uploading buffer to Gemini...");

  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });

  const file: any = await ai.files.upload({
    file: blob,
    config: { displayName },
  });

  if (!file.uri || !file.mimeType) {
    throw new Error("Uploaded Gemini file missing uri or mimeType.");
  }

  console.log("[GEMINI UPLOAD] File ready:", file.uri);

  return {
    uri: String(file.uri),
    mimeType: String(file.mimeType || mimeType),
  };
}
