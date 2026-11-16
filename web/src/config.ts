import type { NavItem } from './ui/Nav';

export { APP_NAME } from './lib/site';

/** Navegación principal del producto; cada página nueva con entrada propia se añade aquí. */
export const NAV: NavItem[] = [
  { href: '/', label: 'Inicio' },
  { href: '/quienes-somos/', label: 'Quiénes somos' },
  { href: '/antes-y-despues/', label: 'Antes y después' },
  { href: '/platos-de-ducha/', label: 'Platos de ducha' },
  { href: '/tarifas/', label: 'Tarifas' },
  { href: '/zonas/', label: 'Zonas' },
  { href: '/preguntas-frecuentes/', label: 'Preguntas frecuentes' },
  { href: '/contacto/', label: 'Contacto' },
];

/** Páginas legales: van en el pie (PieSitio), no en la navegación principal. */
export const LEGALES: NavItem[] = [
  { href: '/aviso-legal/', label: 'Aviso legal' },
  { href: '/privacidad/', label: 'Privacidad' },
  { href: '/cookies/', label: 'Cookies' },
];
