import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell/AppShell";
import { LanguageProvider } from "@/features/language/context/LanguageProvider";
import "./globals.scss";

export const metadata: Metadata = {
  title: {
    default: "English Study",
    template: "%s | English Study",
  },
  description: "A simple English study app for words, grammar, and conversation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
