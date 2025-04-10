import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TestProvider } from "@/contexts/TestContext";
import { Toaster } from "@/components/ui/sonner";
import { atlassianSans } from "./fonts"; // Import custom font

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FB Academy",
  description: "Flytbase Academy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // Include the new custom font variable together with your existing fonts
        className={`${geistSans.variable} ${geistMono.variable} ${atlassianSans.variable} antialiased`}
      >
        <TestProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main>{children}</main>
            <Toaster />
          </ThemeProvider>
        </TestProvider>
      </body>
    </html>
  );
}
