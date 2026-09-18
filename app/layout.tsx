import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberShield — Website Security Posture",
  description: "Permission-gated website security scanning, evidence-led findings and safe remediation workflows."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const stored = window.localStorage.getItem("cybershield.theme"); const theme = stored === "dark" || stored === "light" ? stored : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; } catch {} })();`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
