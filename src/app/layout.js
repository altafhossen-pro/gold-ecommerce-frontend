import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "@/context/AppContext";
import { generateStaticMetadata, generateViewport } from "@/utils/metadata";
import ConditionalHeader from "@/components/Common/ConditionalHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = generateStaticMetadata('home');
export const viewport = generateViewport();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* tag manager script here  */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <ConditionalHeader />
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
