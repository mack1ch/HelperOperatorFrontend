"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./ui.module.scss";

const clean = (p: string) => p.replace(/\/+$/, "") || "/";

export const Header: React.FC = () => {
  const raw = usePathname();
  const pathname = clean(raw);

  const isActive = (href: string) => {
    const target = clean(href);
    if (target === "/") return pathname === "/";
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  return (
    <header className={styles.header}>
      <div className={styles.header__inner}>
        {/* Логотип */}
        <div className={styles.header__logo}>
          <Link href="/" aria-label="На главную">
            <span className={styles.header__brand}>
              <Image
                src="/assets/logos/roseltorg.webp"
                alt="Росэлторг"
                width={120}
                height={32}
                priority
              />
              <span className={styles.header__brandText}>Росэлторг</span>
            </span>
          </Link>
        </div>

        {/* Навигация */}
        <nav className={styles.header__nav}>
          <ul className={styles.header__list}>
            <li>
              <Link
                href="/"
                className={
                  isActive("/")
                    ? styles.header__linkActive
                    : styles.header__link
                }
                aria-current={isActive("/") ? "page" : undefined}
              >
                Чаты
              </Link>
            </li>
            <li>
              <Link
                href="/charts"
                className={
                  isActive("/charts")
                    ? styles.header__linkActive
                    : styles.header__link
                }
                aria-current={isActive("/charts") ? "page" : undefined}
              >
                Аналитика
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
