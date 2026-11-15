import type { NavItem } from './ui/Nav';

export { APP_NAME } from './lib/site';

/** Navegación principal del producto; cada página nueva con entrada propia se añade aquí. */
export const NAV: NavItem[] = [
  { href: '/', label: 'Inicio' },
  { href: '/zonas/', label: 'Zonas' },
  { href: '/preguntas-frecuentes/', label: 'Preguntas frecuentes' },
  { href: '/contacto/', label: 'Contacto' },
];
