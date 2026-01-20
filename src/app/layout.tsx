import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { OneSignalProvider } from "@/components/onesignal-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "Departmental Portal - Student Management System",
  description: "A secure, centralized hub for university department to manage announcements and student applications.",
  keywords: ["Departmental Portal", "Student Management", "University", "Next.js", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "Department of IT" }],
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Portal",
  },
  openGraph: {
    title: "Departmental Portal",
    description: "Centralized hub for department announcements and student applications",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Departmental Portal",
    description: "Centralized hub for department announcements and student applications",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <OneSignalProvider>
              {children}
              <Toaster />
            </OneSignalProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
