import React from "react";

interface DocumentScanOtpEmailProps {
  otp: string;
  email: string;
}

const DocumentScanOtpEmail: React.FC<DocumentScanOtpEmailProps> = ({ otp, email }) => {
  const year = new Date().getFullYear();

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        background: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Outer table wrapper */}
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{ background: "#f3f4f6", padding: "32px 0" }}
      >
        <tbody>
          <tr>
            <td align="center">
              {/* Email card */}
              <table
                width="560"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "28px",
                  boxShadow: "0 6px 18px rgba(15,23,42,0.12)",
                }}
              >
                {/* Header */}
                <tbody>
                  <tr>
                    <td style={{ paddingBottom: "20px" }}>
                      <table width="100%">
                        <tbody>
                          <tr>
                            <td style={{ verticalAlign: "middle" }}>
                              <div
                                style={{
                                  fontSize: "20px",
                                  fontWeight: 600,
                                  color: "#111827",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                <span style={{ color: "#1e88e5" }}>Document</span> Scan
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  marginTop: "4px",
                                }}
                              >
                                Secure • Fast • Smart Document Verification
                              </div>
                            </td>

                            
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Divider */}
                  <tr>
                    <td
                      style={{
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "20px",
                      }}
                    ></td>
                  </tr>

                  {/* Message */}
                  <tr>
                    <td
                      style={{
                        fontSize: "14px",
                        color: "#374151",
                        lineHeight: 1.7,
                        paddingTop: "4px",
                      }}
                    >
                      <p style={{ margin: "0 0 10px" }}>
                        Hi <strong>{email}</strong>,
                      </p>
                      <p style={{ margin: "0 0 10px" }}>
                        Use the one-time password (OTP) below to LoggedIn Successgully At{" "}
                        <strong>Document Scan</strong>.
                      </p>
                      <p style={{ margin: "0 0 10px" }}>
                        This OTP is valid for the next{" "}
                        <strong>100 seconds</strong>. Please do not share it with anyone.
                      </p>
                    </td>
                  </tr>

                  {/* OTP box */}
                  <tr>
                    <td align="center" style={{ padding: "18px 0 10px" }}>
                      <div
                        style={{
                          display: "inline-block",
                          padding: "16px 38px",
                          borderRadius: "999px",
                          background:
                            "linear-gradient(135deg,#1e88e5,#2563eb)",
                          color: "#ffffff",
                          fontSize: "24px",
                          letterSpacing: "6px",
                          fontWeight: 700,
                          boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
                        }}
                      >
                        {otp}
                      </div>
                    </td>
                  </tr>

                  {/* Info */}
                  <tr>
                    <td
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        lineHeight: 1.6,
                        paddingTop: "8px",
                        textAlign: "center",
                      }}
                    >
                      <p style={{ margin: "0 0 6px" }}>
                        Didn’t request this code? Someone might have entered your
                        email by mistake.
                      </p>
                      <p style={{ margin: 0 }}>You can safely ignore this email.</p>
                    </td>
                  </tr>

                  {/* Security tip */}
                  <tr>
                    <td
                      style={{
                        background: "#f9fafb",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        fontSize: "12px",
                        color: "#4b5563",
                        marginTop: "16px",
                      }}
                    >
                      <strong style={{ display: "block", marginBottom: "4px" }}>
                        Security tip
                      </strong>
                      Document Scan will never ask for your OTP via phone or chat.
                    </td>
                  </tr>

                  {/* Footer */}
                  <tr>
                    <td
                      align="center"
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        paddingTop: "20px",
                      }}
                    >
                      <p style={{ margin: "0 0 4px" }}>
                        © {year} Document Scan. All rights reserved.
                      </p>
                      <p style={{ margin: 0 }}>
                        You received this email because you attempted to sign in.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DocumentScanOtpEmail;
