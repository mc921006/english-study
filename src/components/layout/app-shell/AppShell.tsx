import Link from "next/link";
import styles from "./AppShell.module.scss";

const navigationItems = [
  { href: "/words", label: "Words", available: true },
  { href: "/grammar", label: "Grammar", available: true },
  { href: "/conversation", label: "Conversation", available: false },
];

type AppShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="English Study home">
          <span className={styles.brandMark}>ES</span>
          <span className={styles.brandText}>English Study</span>
        </Link>

        <nav className={styles.navigation} aria-label="Primary navigation">
          {navigationItems.map((item) =>
            item.available ? (
              <Link key={item.href} className={styles.navigationLink} href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span
                key={item.href}
                className={styles.navigationLinkDisabled}
                aria-disabled="true"
              >
                {item.label}
              </span>
            ),
          )}
        </nav>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
