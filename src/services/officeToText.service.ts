import { getTextExtractor } from "office-text-extractor";

const extractor = getTextExtractor();

// Office MIME types we want to handle as "special"
export const OFFICE_MIME_TYPES = new Set<string>([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",       // .xlsx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation" // .pptx
  // you can add .doc / .xls / .ppt later if needed
]);

/**
 * Extracts raw text from an Office file buffer (.docx, .xlsx, .pptx)
 * using office-text-extractor. No external software required.
 */
export async function extractOfficeTextFromBuffer(
  buffer: Buffer
): Promise<string> {
  const text = await extractor.extractText({
    input: buffer,
    type: "buffer",
  });

  return text;
}
