import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { Toaster } from "@/Components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Custom Rag bot",
  description: "A PDF RAG bot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider>
        {/* Clerk Authentication Provider */}
        <body
          className={`flex flex-col min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header /> {/* Header Component */}
          <main className="flex-grow overflow-auto">{children}</main>
          <Footer /> {/* Footer Component */}
          <Toaster /> {/* Shadcn Sonner toaster for pop-up notifications */}
        </body>
      </ClerkProvider>
      {/* Clerk Authentication Provider */}
    </html>
  );
}
