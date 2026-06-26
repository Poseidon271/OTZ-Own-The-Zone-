import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BagProvider } from "@/context/BagContext";
import { ThemeProvider } from "@/context/ThemeContext";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  if (storedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <BagProvider>
            {children}
          </BagProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
