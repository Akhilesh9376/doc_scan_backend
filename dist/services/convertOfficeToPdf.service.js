import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
function execAsync(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, _stdout, stderr) => {
            if (error) {
                console.error("[OFFICE->PDF] Exec error:", stderr || error.message);
                return reject(error);
            }
            resolve();
        });
    });
}
const OFFICE_EXTENSIONS = new Set([
    ".doc", ".docx",
    ".xls", ".xlsx",
    ".ppt", ".pptx",
]);
/**
 * Convert a DOCX / XLSX / PPTX / DOC / XLS / PPT buffer into a PDF buffer.
 * Requires LibreOffice (soffice) installed and accessible.
 */
export async function convertOfficeToPdf(buffer, originalFileName) {
    const ext = path.extname(originalFileName).toLowerCase();
    if (!OFFICE_EXTENSIONS.has(ext)) {
        throw new Error(`Unsupported office file type: ${ext}`);
    }
    // Create temporary directory
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "office2pdf-"));
    // Paths for input and output
    const inputPath = path.join(tmpDir, `input${ext}`);
    const outputPath = path.join(tmpDir, `input.pdf`);
    // Write original file buffer to disk
    await fs.writeFile(inputPath, buffer);
    // Use soffice to convert to PDF
    const soffice = "soffice";
    // If Windows cannot find this, use full path:
    // "C:\\Program Files\\LibreOffice\\program\\soffice.exe"
    const convertCmd = `"${soffice}" --headless --convert-to pdf --outdir "${tmpDir}" "${inputPath}"`;
    console.log("[OFFICE->PDF] Running:", convertCmd);
    await execAsync(convertCmd);
    // Read the generated PDF
    const pdfBuffer = await fs.readFile(outputPath);
    // Cleanup (best effort)
    try {
        await fs.unlink(inputPath).catch(() => { });
        await fs.unlink(outputPath).catch(() => { });
        await fs.rmdir(tmpDir).catch(() => { });
    }
    catch { }
    return pdfBuffer;
}
//# sourceMappingURL=convertOfficeToPdf.service.js.map