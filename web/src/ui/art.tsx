import type { ReactNode } from 'react';

/**
 * Ilustraciones SVG propias de Duchas 2 (docs/DESIGN.md § Imágenes). Sustituyen a las fotos del cliente
 * mientras no lleguen: nunca fotos de banco ni iconos de librería. Solo paleta del tema vía var(--…):
 * trazo ink-1 de 2, rellenos surface-1/card, daño en warn/bad, la cinta en --color-tape. Sin lógica.
 * Todas llevan `title` (accesibles) salvo que se pasen como decorativas (`decorative`).
 */

const INK = 'var(--color-text-primary)';
const SURFACE = 'var(--color-background-muted)';
const CARD = 'var(--color-background-card)';
const BRAND = 'var(--color-accent)';
const WARN = 'var(--color-warning)';
const BAD = 'var(--color-error)';
const TAPE = 'var(--color-tape)';
const ON_TAPE = 'var(--color-on-tape)';
const MONO = 'var(--font-family-code)';

export interface ArtProps {
  /** Texto alternativo; si falta y no es decorativa, se usa el de por defecto de cada ilustración. */
  title?: string;
  /** Decorativa: aria-hidden y sin título. */
  decorative?: boolean;
}

function Svg({ viewBox, title, decorative, children }: { viewBox: string; children: ReactNode } & ArtProps) {
  return (
    <svg
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      width="100%"
      fill="none"
      stroke={INK}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid meet"
    >
      {decorative ? null : <title>{title}</title>}
      {children}
    </svg>
  );
}

/** Tira de cinta de enmascarar con texto mono (la firma). Dentro de un SVG. */
function Cinta({ x, y, w, h, text, vertical = false }: { x: number; y: number; w: number; h: number; text: string; vertical?: boolean }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={TAPE} stroke="none" />
      <text
        x={cx}
        y={cy}
        fill={ON_TAPE}
        stroke="none"
        fontFamily={MONO}
        fontSize={vertical ? 14 : 13}
        fontWeight={700}
        letterSpacing={2}
        textAnchor="middle"
        dominantBaseline="central"
        transform={vertical ? `rotate(-90 ${cx} ${cy})` : undefined}
      >
        {text}
      </text>
    </g>
  );
}

/** Plato de ducha visto desde arriba (base de varias ilustraciones). */
function Plato({ x = 20, y = 20, w = 360, h = 260 }: { x?: number; y?: number; w?: number; h?: number }) {
  const dx = x + w / 2;
  const dy = y + h * 0.62;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={18} fill={CARD} />
      <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} rx={12} fill={CARD} strokeOpacity={0.5} />
      <circle cx={dx} cy={dy} r={18} fill={SURFACE} />
      <path d={`M${dx - 10} ${dy} h20 M${dx} ${dy - 10} v20 M${dx - 7} ${dy - 7} l14 14 M${dx + 7} ${dy - 7} l-14 14`} strokeWidth={1.5} />
    </g>
  );
}

/**
 * Hero: plato partido por la cinta; mitad izquierda con desconchón y óxido, derecha con brillo.
 * `sinCinta` quita la cinta vertical «ANTES · DESPUÉS» (el deslizador ya tiene su asa como divisor).
 */
export function PlatoPartido({
  title = 'Ilustración: plato de ducha con un desconchón a la izquierda y recién esmaltado a la derecha',
  decorative,
  sinCinta = false,
}: ArtProps & { sinCinta?: boolean }) {
  return (
    <Svg viewBox="0 0 400 300" title={title} decorative={decorative}>
      <rect x={0} y={0} width={400} height={300} fill={SURFACE} stroke="none" />
      <Plato />
      {/* Antes: desconchón con halo de óxido */}
      <ellipse cx={110} cy={110} rx={46} ry={32} fill={WARN} stroke="none" opacity={0.55} />
      <path d="M86 100 q10 -18 30 -10 q22 4 18 22 q-4 18 -26 16 q-26 -2 -22 -28z" fill={INK} />
      <path d="M140 150 q8 6 4 14" stroke={BAD} />
      {/* Después: reflejos de brillo */}
      <path d="M262 70 q30 -6 52 8" stroke={BRAND} strokeWidth={3} />
      <path d="M276 92 q18 -3 30 4" stroke={BRAND} strokeWidth={3} />
      {sinCinta ? null : <Cinta x={186} y={0} w={28} h={300} text="ANTES · DESPUÉS" vertical />}
    </Svg>
  );
}

export type Dano = 'grieta' | 'golpe' | 'desconchon' | 'perforacion' | 'oxido' | 'brillo';

const DANO_TITULO: Record<Dano, string> = {
  grieta: 'Ilustración: plato de ducha con una grieta',
  golpe: 'Ilustración: plato de ducha con un golpe',
  desconchon: 'Ilustración: plato de ducha con un desconchón',
  perforacion: 'Ilustración: plato de ducha perforado',
  oxido: 'Ilustración: plato de ducha con manchas de óxido',
  brillo: 'Ilustración: plato de ducha que ha perdido el brillo',
};

/** Mini-ilustraciones de los 6 daños (página del plato de ducha). */
export function IlustracionDano({ dano, title, decorative }: ArtProps & { dano: Dano }) {
  const marks: Record<Dano, ReactNode> = {
    grieta: <path d="M40 40 l14 12 l-6 10 l16 10 l-4 12 l14 10" stroke={INK} strokeWidth={2.5} />,
    golpe: <path d="M60 48 l4 10 l10 -4 l-6 9 l9 6 l-11 1 l1 11 l-7 -8 l-7 8 l1 -11 l-11 -1 l9 -6 l-6 -9 l10 4z" fill={INK} />,
    desconchon: (
      <g>
        <ellipse cx={60} cy={62} rx={22} ry={16} fill={WARN} stroke="none" opacity={0.5} />
        <path d="M48 56 q6 -10 16 -6 q12 2 10 12 q-2 10 -14 9 q-14 -1 -12 -15z" fill={INK} />
      </g>
    ),
    perforacion: (
      <g>
        <circle cx={60} cy={62} r={12} fill={INK} />
        <path d="M46 52 l-6 -4 M74 52 l6 -5 M48 74 l-5 5 M72 74 l6 4" stroke={BAD} />
      </g>
    ),
    oxido: (
      <g>
        <ellipse cx={52} cy={58} rx={16} ry={12} fill={WARN} stroke="none" opacity={0.7} />
        <ellipse cx={74} cy={72} rx={10} ry={8} fill={WARN} stroke="none" opacity={0.7} />
        <circle cx={52} cy={58} r={4} fill={BAD} stroke="none" />
      </g>
    ),
    brillo: (
      <g>
        <path d="M30 40 l20 20 M30 52 l20 20 M30 64 l20 20 M42 40 l8 8" stroke={INK} strokeOpacity={0.4} />
        <path d="M70 46 q12 -3 20 4 M72 58 q8 -2 14 2" stroke={BRAND} strokeWidth={3} />
      </g>
    ),
  };
  return (
    <Svg viewBox="0 0 120 120" title={title ?? DANO_TITULO[dano]} decorative={decorative}>
      <rect x={14} y={24} width={92} height={80} rx={10} fill={CARD} />
      {marks[dano]}
    </Svg>
  );
}

export type Compromiso = 'garantia' | 'sin-obras' | 'un-telefono' | 'hoteles';

const COMPROMISO_TITULO: Record<Compromiso, string> = {
  garantia: 'Garantía por escrito',
  'sin-obras': 'Sin obras ni polvo',
  'un-telefono': 'Un solo teléfono, siempre el mismo',
  hoteles: 'Trabajamos para hoteles y comunidades',
};

/** Iconos de la franja de confianza (4 compromisos). */
export function IconoCompromiso({ tipo, title, decorative }: ArtProps & { tipo: Compromiso }) {
  const body: Record<Compromiso, ReactNode> = {
    garantia: (
      <g>
        <path d="M14 6 h22 l8 8 v30 h-30z" fill={CARD} />
        <path d="M20 18 h16 M20 24 h16 M20 30 h10" strokeWidth={1.5} />
        <path d="M22 38 q4 -4 6 0 q2 4 6 -2" stroke={BRAND} />
      </g>
    ),
    'sin-obras': (
      <g>
        <rect x={8} y={14} width={36} height={26} rx={5} fill={CARD} />
        <circle cx={26} cy={30} r={4} fill={SURFACE} />
        <path d="M34 20 q4 -1 6 2" stroke={BRAND} strokeWidth={2.5} />
      </g>
    ),
    'un-telefono': (
      <g>
        <path d="M12 10 q-4 2 -2 8 q6 16 22 22 q6 2 8 -2 l2 -5 l-8 -5 l-4 4 q-8 -4 -12 -12 l4 -4 l-5 -8z" fill={CARD} />
        <text x={38} y={16} fill={BRAND} stroke="none" fontFamily={MONO} fontSize={14} fontWeight={700} textAnchor="middle" dominantBaseline="central">
          1
        </text>
      </g>
    ),
    hoteles: (
      <g>
        <rect x={10} y={8} width={32} height={36} fill={CARD} />
        <path d="M16 16 h6 M30 16 h6 M16 24 h6 M30 24 h6 M16 32 h6 M30 32 h6" strokeWidth={2.5} stroke={BRAND} />
        <path d="M23 44 v-6 h6 v6" />
      </g>
    ),
  };
  return (
    <Svg viewBox="0 0 52 52" title={title ?? COMPROMISO_TITULO[tipo]} decorative={decorative}>
      {body[tipo]}
    </Svg>
  );
}

export type IconoServicioTipo =
  | 'plato'
  | 'banera'
  | 'banera-patas'
  | 'parcial'
  | 'perforada'
  | 'azulejos'
  | 'juntas'
  | 'mampara'
  | 'marmol'
  | 'hoteles';

/** Iconos de servicio (tarjetas y héroes de página de servicio). */
export function IconoServicio({ tipo, title, decorative }: ArtProps & { tipo: IconoServicioTipo }) {
  const tub = <path d="M8 26 h48 v6 q0 12 -12 12 h-24 q-12 0 -12 -12z" fill={CARD} />;
  const body: Record<IconoServicioTipo, ReactNode> = {
    plato: (
      <g>
        <rect x={8} y={12} width={48} height={40} rx={6} fill={CARD} />
        <circle cx={32} cy={38} r={5} fill={SURFACE} />
      </g>
    ),
    banera: <g>{tub}<path d="M14 26 v-12 q0 -6 6 -6 q4 0 5 4" /></g>,
    'banera-patas': <g>{tub}<path d="M18 44 l-3 8 M46 44 l3 8" /></g>,
    parcial: <g>{tub}<rect x={34} y={26} width={10} height={18} fill={TAPE} stroke="none" /></g>,
    perforada: <g>{tub}<circle cx={24} cy={35} r={3} fill={INK} /><ellipse cx={38} cy={36} rx={5} ry={3} fill={WARN} stroke="none" /></g>,
    azulejos: (
      <g>
        <rect x={10} y={10} width={44} height={44} fill={CARD} />
        <path d="M24.7 10 v44 M39.3 10 v44 M10 24.7 h44 M10 39.3 h44" strokeWidth={1.5} />
      </g>
    ),
    juntas: (
      <g>
        <path d="M12 10 v42 h42" />
        <path d="M16 10 v38 h38" stroke={BRAND} strokeWidth={3} />
      </g>
    ),
    mampara: (
      <g>
        <rect x={14} y={8} width={36} height={48} fill={CARD} />
        <path d="M22 18 l10 -6 M22 28 l18 -12" stroke={BRAND} />
      </g>
    ),
    marmol: (
      <g>
        <rect x={10} y={12} width={44} height={40} rx={4} fill={CARD} />
        <path d="M14 22 q12 4 18 14 q6 10 18 12 M28 14 q2 8 10 12" strokeWidth={1.5} strokeOpacity={0.6} />
      </g>
    ),
    hoteles: (
      <g>
        <rect x={16} y={8} width={32} height={48} fill={CARD} />
        <circle cx={42} cy={34} r={2} fill={INK} />
        <text x={32} y={20} fill={BRAND} stroke="none" fontFamily={MONO} fontSize={10} fontWeight={700} textAnchor="middle" dominantBaseline="central">
          214
        </text>
      </g>
    ),
  };
  return (
    <Svg viewBox="0 0 64 64" title={title ?? 'Icono del servicio'} decorative={decorative}>
      {body[tipo]}
    </Svg>
  );
}

/** ¿Reparar o cambiar?: pistola de esmalte + reloj corto frente a maza + saco de escombro. */
export function RepararOCambiar({ title = 'Ilustración: reparar con pistola de esmalte en poco tiempo frente a cambiar con obra y escombro', decorative }: ArtProps) {
  return (
    <Svg viewBox="0 0 240 100" title={title} decorative={decorative}>
      {/* Reparar */}
      <path d="M20 40 h40 v12 h-40z M44 52 l-4 22 h10 l4 -22" fill={CARD} />
      <path d="M60 46 h10" stroke={BRAND} strokeWidth={3} />
      <circle cx={92} cy={50} r={14} fill={CARD} />
      <path d="M92 50 v-8 M92 50 l5 3" />
      {/* Cambiar */}
      <path d="M140 30 h26 v14 h-26z M152 44 v36" fill={CARD} />
      <path d="M190 50 q-4 30 6 34 h24 q10 -4 6 -34 q-18 -6 -36 0z" fill={SURFACE} />
      <path d="M196 64 l6 -4 l4 6 l8 -5" stroke={WARN} />
    </Svg>
  );
}

/** Zonas: esquema de dos anillos concéntricos (capital / área metropolitana). No es un mapa. */
export function AnillosZonas({ title = 'Esquema: Madrid capital en el centro y los municipios del área metropolitana alrededor', decorative, capital = 'MADRID CAPITAL', area = 'ÁREA METROPOLITANA' }: ArtProps & { capital?: string; area?: string }) {
  return (
    <Svg viewBox="0 0 300 300" title={title} decorative={decorative}>
      <circle cx={150} cy={150} r={130} fill={SURFACE} strokeDasharray="6 6" />
      <circle cx={150} cy={150} r={64} fill={CARD} stroke={BRAND} strokeWidth={3} />
      <text x={150} y={150} fill={INK} stroke="none" fontFamily={MONO} fontSize={12} fontWeight={700} textAnchor="middle" dominantBaseline="central">
        {capital}
      </text>
      <text x={150} y={44} fill={INK} stroke="none" fontFamily={MONO} fontSize={11} fontWeight={700} textAnchor="middle" dominantBaseline="central">
        {area}
      </text>
    </Svg>
  );
}

/** Símbolo del logotipo: plato en brand con desagüe card y franja diagonal de cinta. */
export function SimboloMarca({ title = 'Símbolo de la marca', decorative }: ArtProps) {
  return (
    <Svg viewBox="0 0 32 32" title={title} decorative={decorative}>
      <rect x={2} y={2} width={28} height={28} rx={6} fill={BRAND} stroke="none" />
      <path d="M2 22 L22 2 H30 L2 30z" fill={TAPE} stroke="none" />
      <circle cx={20} cy={20} r={4} fill={CARD} stroke="none" />
    </Svg>
  );
}
