import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: [
    "Drop4Life",
    "Blood Donation",
    "Emergency Blood Coordination",
    "Blood Compatibility",
    "Hospital Blood Bank",
    "NGO Blood Drives",
  ],
  authors: [{ name: "Drop4Life Health Network" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased selection:bg-red-100 selection:text-red-900">
        {children}
      </body>
    </html>
  );
}
