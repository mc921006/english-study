import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell/AppShell";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { LanguageProvider } from "@/features/language/context/LanguageProvider";
import "./globals.scss";

export const metadata: Metadata = {
  title: {
    default: "English Study",
    template: "%s | English Study",
  },
  description: "A simple English study app for words, grammar, and conversation.",
  appleWebApp: {
    capable: true,
    title: "English",
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
