export function bufferToDataURI(buffer, mimeType) {
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
//# sourceMappingURL=buffer.js.map