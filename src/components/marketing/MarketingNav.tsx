"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Brand } from "@/components/ui/Brand";
import { Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { APP_PATH, NAV_LINKS } from "@/lib/site";

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const accountLabel = user ? "Mi cuenta" : "Iniciar sesión";

  useEffect(() => {
    if (!open) return;

    // The panel is mobile-only: close it if the viewport reaches desktop.
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const onDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    // Keep the page behind the panel from scrolling while it is open.
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    window.addEventListener("keydown", onKeyDown);
    desktopQuery.addEventListener("change", onDesktopChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktopQuery.removeEventListener("change", onDesktopChange);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  return (
    <header className="marketing-nav-wrap">
      <nav className="nav-pill" aria-label="Navegación principal">
        <Brand href="/" />

        <div className="nav-links">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={`/${link.href}`} className="nav-link">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <ThemeToggle />
          <Link href="/login" className="nav-link">
            {accountLabel}
          </Link>
          <Link href={APP_PATH} className="btn btn-ghost btn-sm">
            Abrir app
          </Link>
          <Link href={APP_PATH} className="btn btn-primary btn-sm">
            Empezar gratis
          </Link>
        </div>

        <button
          type="button"
          className="nav-burger"
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>
      </nav>

      {open && (
        <div className="nav-mobile-panel" id="mobile-nav-panel">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={`/${link.href}`}
              className="nav-mobile-link"
              onClick={() => setOpen(false)}
            >
              {link.label}
              <Icon name="chevronRight" size={16} />
            </Link>
          ))}
          <div className="nav-mobile-theme">
            <span>Tema</span>
            <ThemeToggle />
          </div>
          <div className="nav-mobile-actions">
            <Link
              href={APP_PATH}
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              Abrir app
            </Link>
            <Link
              href={APP_PATH}
              className="btn btn-primary"
              onClick={() => setOpen(false)}
            >
              Empezar gratis
            </Link>
          </div>
          <Link
            href="/login"
            className="nav-mobile-link"
            onClick={() => setOpen(false)}
          >
            {accountLabel}
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      )}
    </header>
  );
}
