import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BagProvider } from "@/context/BagContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "OTZ | Discover & Book Advertising Spaces",
  description: "The premium media and advertising marketplace. Find and book premium billboards, digital screens, cinema spots, and radio slots instantly.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <BagProvider>
          {children}
        </BagProvider>
      </body>
    </html>
  );
}
