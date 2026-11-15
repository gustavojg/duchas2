import type { NavItem } from './ui/Nav';

export { APP_NAME } from './lib/site';

/** Navegación principal del producto; cada página nueva con entrada propia se añade aquí. */
export const NAV: NavItem[] = [
  { href: '/', label: 'Inicio' },
  { href: '/quienes-somos/', label: 'Quiénes somos' },
];

/** Páginas legales: van en el pie (PieSitio), no en la navegación principal. */
export const LEGALES: NavItem[] = [
  { href: '/aviso-legal/', label: 'Aviso legal' },
  { href: '/privacidad/', label: 'Privacidad' },
  { href: '/cookies/', label: 'Cookies' },
];
