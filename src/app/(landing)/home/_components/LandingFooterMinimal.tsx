"use client";

import Link from "next/link";
import { Logo } from "@/components/core/Logo";
import { APP_NAME } from "@/config/config";

const footerLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function LandingFooterMinimal() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 px-4 py-8 dark:border-gray-800">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-6">
            <Logo />
            <div className="flex gap-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-500">
            {currentYear} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
