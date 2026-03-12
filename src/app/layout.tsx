import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const thermochrome = localFont({
  src: "./fonts/MDThermochrome0.4-Variable.ttf",
  variable: "--font-thermochrome",
});

const berkeleyMono = localFont({
  src: "./fonts/BerkeleyMonoTrial-Regular.otf",
  variable: "--font-berkeley-mono",
  weight: "400",
});

export const metadata: Metadata = {
  title: "ElevenLabs Agent + Anam Avatar",
  description:
    "Expressive voice agent with real-time lip-synced avatar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${thermochrome.variable} ${berkeleyMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
