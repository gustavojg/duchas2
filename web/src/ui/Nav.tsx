'use client';

import { TopNavItem } from '@astryxdesign/core/TopNav';
import { usePathname } from 'next/navigation';

export interface NavItem { href: string; label: string }

const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

/**
 * Enlaces de la navegación principal, dentro del TopNav de Frame (que pone el <nav aria-label>).
 * Marca la página actual con isSelected, que Astryx pinta como aria-current="page" (cliente: depende de la URL).
 */
export function Nav({ items }: { items: NavItem[] }) {
  const current = norm(usePathname() ?? '');
  return (
    <>
      {items.map((i) => (
        <TopNavItem key={i.href} href={i.href} label={i.label} isSelected={norm(i.href) === current} />
      ))}
    </>
  );
}
