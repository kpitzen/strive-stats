"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/normal-moves", label: "Normal Moves" },
  { href: "/special-moves", label: "Special Moves" },
  { href: "/overdrive-moves", label: "Overdrive Moves" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto">
        <div className="flex items-center space-x-8 h-16">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 hover:text-gray-700"
          >
            Strive Frames
          </Link>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
} 