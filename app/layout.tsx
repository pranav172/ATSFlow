import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ATSFlow | Beat the Bots. Land the Job.",
  description: "AI-powered resume optimization that gets past applicant tracking systems and in front of hiring managers.",
  keywords: ["ATS", "resume optimization", "AI resume", "job application", "career tools"],
  authors: [{ name: "ATSFlow" }],
  openGraph: {
    title: "ATSFlow - AI-Powered Resume Optimization",
    description: "Beat the ATS. Land the interview.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="antialiased">
          <ToastProvider>
            {children}
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
