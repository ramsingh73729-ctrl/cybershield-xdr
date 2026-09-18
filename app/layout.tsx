import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberShield — Website Security Posture",
  description: "Permission-gated website security scanning, evidence-led findings and safe remediation workflows."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
