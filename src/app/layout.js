import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BagProvider } from "@/context/BagContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import CampaignsModal from "@/components/CampaignsModal";
import LeadPopup from "@/components/LeadPopup";


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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css"
        />
      </head>
      <body className="min-h-full bg-[var(--surface-canvas)] text-[var(--text-primary)] transition-theme antialiased overflow-x-hidden">
        {/* Existing Application Container */}
        <div className="relative z-10 min-h-full flex flex-col">
          <ThemeProvider>
            <AuthProvider>
              <BagProvider>
                {children}
              </BagProvider>
              <AuthModal />
              <CampaignsModal />
              <LeadPopup />
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
