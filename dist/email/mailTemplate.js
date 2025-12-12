import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const DocumentScanOtpEmail = ({ otp, email }) => {
    const year = new Date().getFullYear();
    return (_jsx("div", { style: {
            margin: 0,
            padding: 0,
            background: "#f3f4f6",
            fontFamily: "Arial, sans-serif",
        }, children: _jsx("table", { width: "100%", cellPadding: 0, cellSpacing: 0, style: { background: "#f3f4f6", padding: "32px 0" }, children: _jsx("tbody", { children: _jsx("tr", { children: _jsx("td", { align: "center", children: _jsx("table", { width: "560", cellPadding: 0, cellSpacing: 0, style: {
                                background: "#ffffff",
                                borderRadius: "14px",
                                padding: "28px",
                                boxShadow: "0 6px 18px rgba(15,23,42,0.12)",
                            }, children: _jsxs("tbody", { children: [_jsx("tr", { children: _jsx("td", { style: { paddingBottom: "20px" }, children: _jsx("table", { width: "100%", children: _jsx("tbody", { children: _jsx("tr", { children: _jsxs("td", { style: { verticalAlign: "middle" }, children: [_jsxs("div", { style: {
                                                                        fontSize: "20px",
                                                                        fontWeight: 600,
                                                                        color: "#111827",
                                                                        letterSpacing: "0.5px",
                                                                    }, children: [_jsx("span", { style: { color: "#1e88e5" }, children: "Document" }), " Scan"] }), _jsx("div", { style: {
                                                                        fontSize: "12px",
                                                                        color: "#6b7280",
                                                                        marginTop: "4px",
                                                                    }, children: "Secure \u2022 Fast \u2022 Smart Document Verification" })] }) }) }) }) }) }), _jsx("tr", { children: _jsx("td", { style: {
                                                borderTop: "1px solid #e5e7eb",
                                                paddingTop: "20px",
                                            } }) }), _jsx("tr", { children: _jsxs("td", { style: {
                                                fontSize: "14px",
                                                color: "#374151",
                                                lineHeight: 1.7,
                                                paddingTop: "4px",
                                            }, children: [_jsxs("p", { style: { margin: "0 0 10px" }, children: ["Hi ", _jsx("strong", { children: email }), ","] }), _jsxs("p", { style: { margin: "0 0 10px" }, children: ["Use the one-time password (OTP) below to LoggedIn Successgully At", " ", _jsx("strong", { children: "Document Scan" }), "."] }), _jsxs("p", { style: { margin: "0 0 10px" }, children: ["This OTP is valid for the next", " ", _jsx("strong", { children: "100 seconds" }), ". Please do not share it with anyone."] })] }) }), _jsx("tr", { children: _jsx("td", { align: "center", style: { padding: "18px 0 10px" }, children: _jsx("div", { style: {
                                                    display: "inline-block",
                                                    padding: "16px 38px",
                                                    borderRadius: "999px",
                                                    background: "linear-gradient(135deg,#1e88e5,#2563eb)",
                                                    color: "#ffffff",
                                                    fontSize: "24px",
                                                    letterSpacing: "6px",
                                                    fontWeight: 700,
                                                    boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
                                                }, children: otp }) }) }), _jsx("tr", { children: _jsxs("td", { style: {
                                                fontSize: "12px",
                                                color: "#6b7280",
                                                lineHeight: 1.6,
                                                paddingTop: "8px",
                                                textAlign: "center",
                                            }, children: [_jsx("p", { style: { margin: "0 0 6px" }, children: "Didn\u2019t request this code? Someone might have entered your email by mistake." }), _jsx("p", { style: { margin: 0 }, children: "You can safely ignore this email." })] }) }), _jsx("tr", { children: _jsxs("td", { style: {
                                                background: "#f9fafb",
                                                borderRadius: "10px",
                                                padding: "12px 14px",
                                                fontSize: "12px",
                                                color: "#4b5563",
                                                marginTop: "16px",
                                            }, children: [_jsx("strong", { style: { display: "block", marginBottom: "4px" }, children: "Security tip" }), "Document Scan will never ask for your OTP via phone or chat."] }) }), _jsx("tr", { children: _jsxs("td", { align: "center", style: {
                                                fontSize: "11px",
                                                color: "#9ca3af",
                                                paddingTop: "20px",
                                            }, children: [_jsxs("p", { style: { margin: "0 0 4px" }, children: ["\u00A9 ", year, " Document Scan. All rights reserved."] }), _jsx("p", { style: { margin: 0 }, children: "You received this email because you attempted to sign in." })] }) })] }) }) }) }) }) }) }));
};
export default DocumentScanOtpEmail;
//# sourceMappingURL=mailTemplate.js.map