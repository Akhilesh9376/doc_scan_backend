/**
 * Shared types between client and server
 */

// Authentication types
export interface SendOTPRequest {
  email?: string;
  phone?: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface VerifyOTPRequest {
  email?: string;
  phone?: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email?: string;
    phone?: string;
  };
}

export interface DemoResponse {
  message: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  createdAt: string;
  uploadCount: number;
  uploadLimitReachedToday: boolean;
}

// Document types
export interface DocumentMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  userId?: string;
  summary?: string;
  insights?: Insight[];
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "strategic" | "financial" | "legal" | "operational" | "other";
  relevanceScore: number;
}

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  summary: string;
  insights: Insight[];
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  documentId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  audioUrl?: string;
  isVoice?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
