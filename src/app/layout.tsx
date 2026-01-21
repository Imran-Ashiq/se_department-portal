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
  maximumScale: 5,
  userScalable: true,
  themeColor: "#4f46e5",
};

export const metadata: Metadata = {
  title: "SE Portal - IUB Department",
  description: "Department Management Portal for IUB Software Engineering - Manage notices, applications, and announcements",
  keywords: ["IUB", "Software Engineering", "Student Portal", "Department Portal", "University Management"],
  authors: [{ name: "IUB SE Department" }],
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SE Portal",
  },
  applicationName: "SE Portal",
  openGraph: {
    title: "SE Portal - IUB Department",
    description: "Department Management Portal for IUB Software Engineering",
    type: "website",
    siteName: "SE Portal",
  },
  twitter: {
    card: "summary_large_image",
    title: "SE Portal - IUB Department",
    description: "Department Management Portal for IUB Software Engineering",
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
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SE Portal" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
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
