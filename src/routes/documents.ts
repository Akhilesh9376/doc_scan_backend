import { Router } from "express";
import {
  handleUploadDocument,
  handleGetDocuments,
  handleAnalyzeDocument,
} from "../controllers/documents.controller.js";

const router = Router();

router.post("/upload", handleUploadDocument);
router.get("/", handleGetDocuments);
router.post("/:documentId/analyze", handleAnalyzeDocument);

export default router;
