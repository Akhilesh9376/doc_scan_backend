import { RequestHandler } from "express";
import { SendOTPRequest, SendOTPResponse, VerifyOTPRequest, VerifyOTPResponse } from "../types/api.js";
import crypto from "crypto";
import { User } from "../models/User.js";
import { OTPSession } from "../models/OTPSession.js";
import DocumentScanOtpEmail from "../email/mailTemplate.js";
import React from "react";
import nodemailer from "nodemailer";

import { renderToString } from "react-dom/server";
// const OTP_EXPIRY_MS = 60000; // 1 minute
const OTP_EXPIRY_MS = 100000; // 100 seconds
const OTP_LENGTH = 6;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const jwtTokens = new Map<string, { userId: string; createdAt: number }>();




export const handleSendOTP: RequestHandler<{}, SendOTPResponse, SendOTPRequest> = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone is required",
        expiresIn: 0,
      });
    }

    const identifier = email || phone || "";
    const otp = Math.random().toString().slice(2, 2 + OTP_LENGTH).padStart(OTP_LENGTH, "0");
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await OTPSession.findOneAndUpdate(
      { identifier },
      {
        code: otp,
        expiresAt,
        attempts: 0,
      },
      { upsert: true, new: true }
    );

    // ============================
    // EMAIL via NODEMAILER
    // ============================
    if (email) {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.FROM_EMAIL) {
        console.error("SMTP env vars missing");
        return res.status(500).json({
          success: false,
          message: "Email provider not configured",
          expiresIn: 0,
        });
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // true if using port 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Render your React email component to HTML string
      const html = renderToString(
        React.createElement(DocumentScanOtpEmail, { otp, email })
      );

      try {
        const info = await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: email,
          subject: "Your Document Scan OTP",
          html,
        });

        console.log("OTP email sent:", info.messageId);
      } catch (err) {
        console.error("Nodemailer send error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP email",
          expiresIn: 0,
        });
      }
    }

    // For SMS, you can add Twilio/Vonage here later

    // For testing: Log OTP (remove in production)
    console.log(`[TEST] OTP for ${identifier}: ${otp}`);

    return res.json({
      success: true,
      message: `OTP sent to ${email ? "email" : "phone"} (check console for test OTP)`,
      expiresIn: OTP_EXPIRY_MS,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      expiresIn: 0,
    });
  }
};


export const handleVerifyOTP: RequestHandler<{}, VerifyOTPResponse, VerifyOTPRequest> = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    const identifier = email || phone || "";

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email/phone and OTP are required",
      });
    }

    if (otp.length !== 6 || isNaN(Number(otp))) {
      return res.status(400).json({
        success: false,
        message: "OTP must be 6 digits",
      });
    }

    const otpSession = await OTPSession.findOne({ identifier });

    if (!otpSession) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (new Date() > otpSession.expiresAt) {
      await OTPSession.deleteOne({ identifier });
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    // In development, accept any 6-digit OTP for testing
    // const isDevelopment = process.env.NODE_ENV !== "isDevelopment";
    // const isValidOTP = isDevelopment || otpSession.code === otp;
    const isValidOTP = otpSession.code === otp;

    if (!isValidOTP) {
      otpSession.attempts += 1;
      if (otpSession.attempts >= otpSession.maxAttempts) {
        await OTPSession.deleteOne({ identifier });
        return res.status(400).json({
          success: false,
          message: "Maximum OTP attempts exceeded. Please request a new OTP.",
        });
      }
      await otpSession.save();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${otpSession.maxAttempts - otpSession.attempts} attempts remaining.`,
      });
    }




    const query: any = {};
    if (email) {
      query.email = email;
    } else if (phone) {
      query.phone = phone;
    }

    let user = await User.findOne(query);

    if (!user) {
      user = new User({
        email: email || undefined,
        phone: phone || undefined,
        uploadCount: 0,
        isPremium: false,
        lastLogin: new Date(),
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    await OTPSession.deleteOne({ identifier });

    const token = crypto.randomBytes(32).toString("hex");
    const refreshToken = crypto.randomBytes(32).toString("hex");

    jwtTokens.set(token, {
      userId: user._id.toString(),
      createdAt: Date.now(),
    });

    return res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email ?? undefined,
        phone: user.phone ?? undefined,
      },
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

export const handleVerifyToken: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const tokenData = jwtTokens.get(token);

    if (!tokenData) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (Date.now() - tokenData.createdAt > TOKEN_EXPIRY_MS) {
      jwtTokens.delete(token);
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    const user = await User.findById(tokenData.userId);

    if (!user) {
      jwtTokens.delete(token);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        phone: user.phone,
        uploadCount: user.uploadCount,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Token verification failed",
    });
  }
};

export function getUserFromToken(token?: string) {
  if (!token) return null;
  const tokenData = jwtTokens.get(token);
  if (!tokenData) return null;
  return tokenData.userId;
}
