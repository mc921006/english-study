import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell/AppShell";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { LanguageProvider } from "@/features/language/context/LanguageProvider";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/appBranding";
import "./globals.scss";

export const metadata: Metadata = {
  metadataBase: new URL("https://english-study-navy.vercel.app"),
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "language learning",
    "English learning",
    "Vietnamese learning",
    "Japanese learning",
    "word study",
    "conversation practice",
  ],
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <PwaRegistrar />
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
