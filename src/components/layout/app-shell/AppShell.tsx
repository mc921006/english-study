"use client";

import Link from "next/link";
import { LanguageMenu } from "@/features/language/components/language-menu/LanguageMenu";
import {
  getAvailableStudyFeatures,
} from "@/features/language/languageConfig";
import { useStudyLanguage } from "@/features/language/context/LanguageProvider";
import { APP_NAME } from "@/lib/appBranding";
import styles from "./AppShell.module.scss";

type AppShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  const { languageId } = useStudyLanguage();
  const navigationItems = getAvailableStudyFeatures(languageId);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <LanguageMenu />
          <Link
            className={styles.brandLink}
            href="/"
            aria-label={`${APP_NAME} home`}
          >
            <span className={styles.brandText}>{APP_NAME}</span>
          </Link>
        </div>

        <div className={styles.headerActions}>
          <nav className={styles.navigation} aria-label="Primary navigation">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                className={styles.navigationLink}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
