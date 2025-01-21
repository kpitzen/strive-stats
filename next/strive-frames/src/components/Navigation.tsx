"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.scss';

const navItems = [
  { href: "/", label: "Strive Frames" },
  { href: "/normal-moves", label: "Normal Moves" },
  { href: "/special-moves", label: "Special Moves" },
  { href: "/overdrive-moves", label: "Overdrive Moves" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.root}>
      <div className={styles.content}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? styles.active : ''}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
} 