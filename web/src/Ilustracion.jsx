import { useId } from 'react'

/* Ilustraciones de producto dibujadas en SVG (el dataset es sintético y no tiene fotos).
   Si un producto trae `imagen_url`, se muestra esa foto en su lugar.
   Cada producto tiene un tipo de dibujo y un color propio. */

export const DIBUJO = {
  prod_01: ['auriculares', '#2E3A59'], prod_02: ['estuche', '#E6E0D4'], prod_03: ['cargador', '#F1F1EE'],
  prod_04: ['altavoz', '#C0483A'], prod_05: ['funda_movil', '#7BA88E'], prod_06: ['protector', '#BFD7EA'],
  prod_07: ['powerbank', '#3B3F45'], prod_08: ['cable', '#D7263D'], prod_09: ['soporte_coche', '#2B2B2B'],
  prod_10: ['reloj', '#1F6F78'], prod_11: ['correa', '#F28F3B'], prod_12: ['raton', '#1C1C21'],
  prod_13: ['teclado', '#2A2D34'], prod_14: ['alfombrilla', '#23262E'], prod_15: ['auriculares_gaming', '#3A3F58'],
  prod_16: ['mando', '#E4E7EB'], prod_17: ['microfono', '#2F3136'], prod_18: ['brazo_micro', '#2B2B2B'],
  prod_19: ['aro_luz', '#2B2B2B'], prod_20: ['monitor', '#202326'], prod_21: ['brazo_monitor', '#B8BCC2'],
  prod_22: ['hub', '#8C9096'], prod_23: ['webcam', '#1E1E1E'], prod_24: ['ssd', '#5B6C8F'],
  prod_25: ['usb', '#C0C4C9'], prod_26: ['lampara', '#E9E9E9'], prod_27: ['mochila', '#4A5A4F'],
  prod_28: ['funda_portatil', '#6C7A89'], prod_29: ['freidora', '#2C2C2C'], prod_30: ['papel', '#E8DCC4'],
  prod_31: ['cafetera', '#B23A48'], prod_32: ['molinillo', '#3D3D3D'], prod_33: ['espumador', '#D4D6D8'],
  prod_34: ['sartenes', '#2F2F33'], prod_35: ['tablas', '#C9A36B'], prod_36: ['batidora', '#9AA0A6'],
  prod_37: ['robot', '#EFEFEF'], prod_38: ['recambios', '#DADADA'], prod_39: ['bombilla', '#F2C94C'],
  prod_40: ['enchufe', '#F7F7F7'], prod_41: ['humidificador', '#BFE3E0'], prod_42: ['esterilla', '#7E57C2'],
  prod_43: ['bandas', '#E76F51'], prod_44: ['botella', '#3E8E7E'], prod_45: ['mancuernas', '#34363A'],
  prod_46: ['rodillo', '#2C7DA0'], prod_47: ['mochila_deporte', '#D1495B'], prod_48: ['rascador', '#C8B6A6'],
  prod_49: ['comedero', '#F3F3F1'], prod_50: ['juguete', '#F4A259'],
}

// Mezcla un color con blanco (cantidad > 0) o negro (cantidad < 0)
function tono(hex, cantidad) {
  const n = parseInt(hex.slice(1), 16)
  const canal = (c) => {
    const destino = cantidad > 0 ? 255 : 0
    return Math.round(c + (destino - c) * Math.abs(cantidad))
  }
  const r = canal(n >> 16), g = canal((n >> 8) & 255), b = canal(n & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

export default function Ilustracion({ producto, fondo, className = '' }) {
  const uid = useId().replace(/:/g, '')
  if (producto.imagen_url) {
    return (
      <div className={`ilustracion ${className}`} style={{ background: fondo }}>
        <img src={producto.imagen_url} alt={producto.nombre} />
      </div>
    )
  }
  const [tipo, color] = DIBUJO[producto.producto_id] ?? ['caja', '#8A9A92']
  const c = {
    base: color, claro: tono(color, 0.35), oscuro: tono(color, -0.35), muy: tono(color, -0.6),
    G: `url(#${uid}-g)`, H: `url(#${uid}-h)`, M: `url(#${uid}-m)`, V: `url(#${uid}-v)`, R: `url(#${uid}-r)`,
    marca: producto.marca ?? '', uid,
  }
  const Dibujo = DIBUJOS[tipo] ?? DIBUJOS.caja
  return (
    <div className={`ilustracion ${className}`} style={{ background: fondo }}>
      <svg viewBox="0 0 240 180" role="img" aria-label={producto.nombre}>
        <defs>
          <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.claro} /><stop offset=".55" stopColor={c.base} /><stop offset="1" stopColor={c.oscuro} />
          </linearGradient>
          <linearGradient id={`${uid}-h`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={c.oscuro} /><stop offset=".35" stopColor={c.claro} /><stop offset="1" stopColor={c.oscuro} />
          </linearGradient>
          <linearGradient id={`${uid}-m`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F4F5F6" /><stop offset=".5" stopColor="#B9BEC4" /><stop offset="1" stopColor="#7E848B" />
          </linearGradient>
          <linearGradient id={`${uid}-v`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity=".85" /><stop offset="1" stopColor="#CFE3F2" stopOpacity=".45" />
          </linearGradient>
          <linearGradient id={`${uid}-r`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FF3D7F" /><stop offset=".33" stopColor="#7B5CFF" />
            <stop offset=".66" stopColor="#22C1EE" /><stop offset="1" stopColor="#3DFFA2" />
          </linearGradient>
          <radialGradient id={`${uid}-s`}>
            <stop offset="0" stopColor="#000" stopOpacity=".22" /><stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="120" cy="162" rx="84" ry="9" fill={`url(#${uid}-s)`} />
        <Dibujo {...c} />
      </svg>
    </div>
  )
}

const Marca = ({ x, y, t, color = '#fff', size = 8, anchor = 'middle' }) => (
  <text x={x} y={y} fill={color} fontSize={size} fontFamily="Arial, sans-serif" fontWeight="700"
    textAnchor={anchor} letterSpacing=".5" opacity=".85">{t}</text>
)
const Brillo = ({ d }) => <path d={d} fill="#fff" opacity=".22" />

const DIBUJOS = {
  caja: ({ G, oscuro }) => <><rect x="70" y="50" width="100" height="100" rx="10" fill={G} /><path d="M70 80h100" stroke={oscuro} /></>,

  auriculares: ({ G, oscuro, muy, claro, marca }) => (
    <>
      <path d="M58 112C58 34 182 34 182 112" fill="none" stroke={muy} strokeWidth="13" strokeLinecap="round" />
      <path d="M62 104C66 48 174 48 178 104" fill="none" stroke={claro} strokeWidth="3" strokeLinecap="round" opacity=".45" />
      <rect x="40" y="92" width="42" height="64" rx="20" fill={G} />
      <rect x="158" y="92" width="42" height="64" rx="20" fill={G} />
      <rect x="74" y="100" width="14" height="48" rx="7" fill={muy} />
      <rect x="152" y="100" width="14" height="48" rx="7" fill={muy} />
      <Brillo d="M46 104c4-8 14-10 22-8-8 4-14 14-14 30-6-4-10-14-8-22z" />
      <Brillo d="M164 104c4-8 14-10 22-8-8 4-14 14-14 30-6-4-10-14-8-22z" />
      <Marca x="179" y="128" t={marca} size={6} />
      <circle cx="61" cy="140" r="2.5" fill="#7FD3B2" />
      <circle cx="61" cy="120" r="1" fill={oscuro} />
    </>
  ),

  auriculares_gaming: (c) => (
    <>
      {DIBUJOS.auriculares(c)}
      <rect x="44" y="96" width="34" height="56" rx="17" fill="none" stroke={c.R} strokeWidth="3" />
      <rect x="162" y="96" width="34" height="56" rx="17" fill="none" stroke={c.R} strokeWidth="3" />
      <path d="M52 146C58 166 86 170 104 162" fill="none" stroke={c.muy} strokeWidth="5" strokeLinecap="round" />
      <rect x="100" y="155" width="16" height="12" rx="6" fill={c.muy} />
    </>
  ),

  estuche: ({ G, oscuro, M, marca }) => (
    <>
      <path d="M168 70c18-6 26 12 14 22" fill="none" stroke={M} strokeWidth="6" strokeLinecap="round" />
      <rect x="62" y="62" width="116" height="92" rx="40" fill={G} />
      <path d="M64 98H176" stroke={oscuro} strokeWidth="2" opacity=".6" />
      <Brillo d="M76 76c18-10 50-12 74-8-30 2-56 10-70 22-4-4-6-10-4-14z" />
      <circle cx="120" cy="126" r="3.5" fill="#5BC79A" />
      <Marca x="120" y="142" t={marca} color={oscuro} size={7} />
    </>
  ),

  cargador: ({ G, M, oscuro, muy, marca }) => (
    <>
      <rect x="100" y="28" width="10" height="30" rx="2" fill={M} />
      <rect x="130" y="28" width="10" height="30" rx="2" fill={M} />
      <rect x="78" y="54" width="84" height="98" rx="16" fill={G} stroke={oscuro} strokeOpacity=".25" />
      <Brillo d="M86 64h40c-14 4-26 14-32 34-6-8-10-24-8-34z" />
      <rect x="106" y="120" width="28" height="10" rx="5" fill={muy} />
      <Marca x="120" y="102" t={marca} color={oscuro} size={9} />
      <Marca x="120" y="112" t="30W" color={oscuro} size={6} />
    </>
  ),

  altavoz: ({ uid, G, oscuro, muy, claro, marca }) => (
    <>
      <defs>
        <pattern id={`${uid}-p`} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.4" fill={muy} opacity=".55" />
        </pattern>
      </defs>
      <rect x="38" y="76" width="164" height="78" rx="39" fill={G} />
      <rect x="62" y="80" width="116" height="70" fill={`url(#${uid}-p)`} />
      <ellipse cx="190" cy="115" rx="12" ry="37" fill={oscuro} />
      <ellipse cx="190" cy="115" rx="7" ry="26" fill={muy} />
      <rect x="96" y="70" width="48" height="10" rx="5" fill={muy} />
      <circle cx="108" cy="75" r="2" fill={claro} /><circle cx="120" cy="75" r="2" fill={claro} /><circle cx="132" cy="75" r="2" fill={claro} />
      <Brillo d="M52 90c30-10 80-12 120-6-50 2-90 8-112 20-6-4-10-10-8-14z" />
      <Marca x="120" y="140" t={marca} size={8} />
    </>
  ),

  funda_movil: ({ G, oscuro, muy, marca }) => (
    <>
      <rect x="82" y="18" width="80" height="142" rx="18" fill={G} />
      <rect x="90" y="26" width="64" height="126" rx="13" fill="none" stroke={oscuro} strokeOpacity=".35" />
      <rect x="94" y="30" width="34" height="40" rx="10" fill={muy} />
      <circle cx="104" cy="41" r="6" fill="#111" stroke="#555" /><circle cx="104" cy="59" r="6" fill="#111" stroke="#555" />
      <circle cx="119" cy="50" r="3" fill="#ddd" />
      <Brillo d="M146 30c4 30 4 80-2 118-4-36-4-80 2-118z" />
      <Marca x="122" y="120" t={marca} color={oscuro} size={8} />
    </>
  ),

  protector: ({ V }) => (
    <>
      <rect x="64" y="34" width="76" height="126" rx="14" fill="#DDEBF5" stroke="#8FB2CC" strokeWidth="1.5" opacity=".85" />
      <rect x="100" y="22" width="76" height="126" rx="14" fill={V} stroke="#8FB2CC" strokeWidth="1.5" />
      <rect x="128" y="28" width="20" height="5" rx="2.5" fill="#8FB2CC" />
      <path d="M112 40h44l-34 72h-10z" fill="#fff" opacity=".5" />
      <Marca x="138" y="132" t="9H" color="#4D7A99" size={14} />
    </>
  ),

  powerbank: ({ G, muy, claro, marca }) => (
    <>
      <rect x="54" y="58" width="132" height="94" rx="18" fill={G} />
      <rect x="54" y="140" width="132" height="12" rx="6" fill={muy} opacity=".5" />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={96 + i * 12} cy="128" r="3" fill={i < 3 ? '#5BE3A5' : muy} />)}
      <rect x="66" y="64" width="18" height="6" rx="3" fill={muy} /><rect x="90" y="64" width="12" height="6" rx="3" fill={muy} />
      <Brillo d="M62 76c40-8 90-8 116-2-40 0-84 6-112 18-4-4-6-12-4-16z" />
      <Marca x="120" y="106" t={marca} size={11} color={claro} />
      <Marca x="120" y="117" t="20.000 mAh" size={6} color={claro} />
    </>
  ),

  cable: ({ base, oscuro, M }) => (
    <>
      <path d="M58 132C30 120 40 70 80 76s50 60 90 50 30-60-4-66" fill="none" stroke={oscuro} strokeWidth="9" strokeLinecap="round" />
      <path d="M58 132C30 120 40 70 80 76s50 60 90 50 30-60-4-66" fill="none" stroke={base} strokeWidth="6" strokeDasharray="3 3" strokeLinecap="round" />
      <rect x="54" y="124" width="22" height="34" rx="6" fill={oscuro} transform="rotate(20 65 141)" />
      <rect x="58" y="152" width="14" height="14" rx="3" fill={M} transform="rotate(20 65 159)" />
      <rect x="154" y="44" width="22" height="34" rx="6" fill={oscuro} transform="rotate(-70 165 61)" />
      <rect x="140" y="56" width="14" height="14" rx="3" fill={M} transform="rotate(-70 147 63)" />
    </>
  ),

  soporte_coche: ({ G, muy, M, oscuro }) => (
    <>
      <rect x="92" y="108" width="56" height="50" rx="8" fill={muy} />
      <path d="M104 158v12M120 158v12M136 158v12" stroke={M} strokeWidth="5" strokeLinecap="round" />
      <circle cx="120" cy="80" r="46" fill={G} />
      <circle cx="120" cy="80" r="34" fill="none" stroke={oscuro} strokeWidth="2" />
      <circle cx="120" cy="80" r="16" fill={M} />
      <Brillo d="M86 64c10-20 40-28 60-18-26 0-46 10-56 28z" />
    </>
  ),

  reloj: ({ base, oscuro, muy, claro }) => (
    <>
      <rect x="96" y="14" width="48" height="50" rx="10" fill={base} />
      <rect x="96" y="118" width="48" height="50" rx="10" fill={base} />
      {[130, 140, 150].map((y) => <circle key={y} cx="120" cy={y} r="2.4" fill={oscuro} />)}
      <rect x="82" y="46" width="76" height="86" rx="22" fill={muy} />
      <rect x="88" y="52" width="64" height="74" rx="17" fill="#0E1513" />
      <text x="120" y="88" fill="#fff" fontSize="18" fontFamily="Arial" fontWeight="700" textAnchor="middle">10:09</text>
      <path d="M100 104h12l4-8 6 14 4-6h14" fill="none" stroke="#5BE3A5" strokeWidth="2" />
      <rect x="157" y="72" width="5" height="14" rx="2" fill={claro} />
      <Brillo d="M92 58c18-6 36-6 50-2-20 2-34 8-44 18-4-4-8-12-6-16z" />
    </>
  ),

  correa: ({ G, oscuro, M }) => (
    <>
      <path d="M50 120C50 60 190 60 190 120" fill="none" stroke={oscuro} strokeWidth="30" strokeLinecap="round" />
      <path d="M50 120C50 60 190 60 190 120" fill="none" stroke={G} strokeWidth="26" strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={128 + i * 11} cy={78 + i * 7} r="2.6" fill={oscuro} />)}
      <rect x="38" y="118" width="24" height="10" rx="3" fill={M} />
      <rect x="178" y="118" width="24" height="10" rx="3" fill={M} />
    </>
  ),

  raton: ({ G, muy, R, claro, marca }) => (
    <>
      <path d="M120 22C162 22 172 66 172 104C172 142 150 162 120 162C90 162 68 142 68 104C68 66 78 22 120 22Z" fill={G} />
      <path d="M120 24V84" stroke={muy} strokeWidth="2.5" />
      <path d="M70 92C90 84 150 84 170 92" fill="none" stroke={muy} strokeWidth="2" opacity=".6" />
      <rect x="113" y="42" width="14" height="26" rx="7" fill={muy} />
      <rect x="116" y="46" width="8" height="18" rx="4" fill={R} />
      <path d="M74 122C88 156 152 156 166 122" fill="none" stroke={R} strokeWidth="3.5" />
      <path d="M86 40C96 30 108 26 116 26 102 34 92 50 88 70 84 60 84 48 86 40Z" fill="#fff" opacity=".18" />
      <Marca x="120" y="132" t={marca} size={8} color={claro} />
    </>
  ),

  teclado: ({ G, muy, R, marca }) => (
    <>
      <path d="M26 74L214 74L226 140L14 140Z" fill={G} />
      <path d="M14 140L226 140L226 150L14 150Z" fill={muy} />
      {[0, 1, 2, 3].map((fila) =>
        Array.from({ length: 12 - (fila === 3 ? 4 : 0) }).map((_, i) => {
          const y = 80 + fila * 14
          const desp = fila * 3
          const ancho = fila === 3 && i === 3 ? 60 : 13
          const x = 30 - desp + i * 15.5 + (fila === 3 && i > 3 ? 47 : 0)
          return <rect key={`${fila}-${i}`} x={x} y={y} width={ancho} height="11" rx="2.5" fill="#2E323A" stroke="#4A4F59" strokeWidth=".8" />
        }),
      )}
      <path d="M24 144H216" stroke={R} strokeWidth="2.5" />
      <Marca x="210" y="84" t={marca} size={5} anchor="end" />
    </>
  ),

  alfombrilla: ({ base, oscuro, R, marca }) => (
    <>
      <path d="M44 70L222 70L196 150L18 150Z" fill={base} stroke={R} strokeWidth="3" />
      <path d="M50 76L214 76L191 144L27 144Z" fill="none" stroke="#fff" strokeOpacity=".15" strokeDasharray="4 3" />
      <Brillo d="M60 80h90c-40 10-70 30-90 60-10-20-6-44 0-60z" />
      <text x="190" y="138" fill={oscuro} fontSize="14" fontFamily="Arial" fontWeight="900" textAnchor="end" opacity=".9" stroke="#fff" strokeOpacity=".25">{marca}</text>
    </>
  ),

  mando: ({ G, oscuro, muy }) => (
    <>
      <path d="M60 70C80 58 160 58 180 70C204 84 214 150 192 156C176 160 166 132 150 126H90C74 132 64 160 48 156C26 150 36 84 60 70Z" fill={G} stroke={oscuro} strokeOpacity=".3" />
      <circle cx="94" cy="110" r="13" fill={muy} /><circle cx="94" cy="110" r="8" fill="#3A3D44" />
      <circle cx="146" cy="122" r="11" fill={muy} /><circle cx="146" cy="122" r="7" fill="#3A3D44" />
      <path d="M72 88h14M79 81v14" stroke={muy} strokeWidth="5" strokeLinecap="round" />
      <circle cx="164" cy="82" r="5" fill="#2BB673" /><circle cx="176" cy="92" r="5" fill="#E94F37" />
      <circle cx="152" cy="92" r="5" fill="#2D9CDB" /><circle cx="164" cy="102" r="5" fill="#F2C94C" />
      <Brillo d="M68 76c26-8 70-10 100-6-40 2-72 8-94 20-4-4-8-10-6-14z" />
    </>
  ),

  microfono: ({ G, M, muy, oscuro, marca }) => (
    <>
      <ellipse cx="120" cy="156" rx="40" ry="8" fill={muy} />
      <rect x="116" y="118" width="8" height="38" fill={M} />
      <path d="M92 104C92 128 148 128 148 104" fill="none" stroke={M} strokeWidth="5" />
      <rect x="94" y="20" width="52" height="98" rx="26" fill={G} />
      {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M98 ${32 + i * 6}H142`} stroke={muy} strokeWidth="1.6" opacity=".7" />)}
      <rect x="94" y="84" width="52" height="5" fill={oscuro} />
      <circle cx="120" cy="100" r="3" fill="#E94F37" />
      <Brillo d="M100 30c4-8 12-10 18-10-8 6-12 20-12 40-6-10-8-22-6-30z" />
      <Marca x="120" y="112" t={marca} size={5} />
    </>
  ),

  brazo_micro: ({ base, M, muy }) => (
    <>
      <rect x="40" y="132" width="26" height="30" rx="4" fill={muy} />
      <path d="M53 132L90 70L160 60" fill="none" stroke={base} strokeWidth="8" strokeLinecap="round" />
      <path d="M58 124L94 76L156 68" fill="none" stroke={M} strokeWidth="2" />
      <circle cx="53" cy="132" r="7" fill={M} /><circle cx="90" cy="70" r="7" fill={M} /><circle cx="160" cy="60" r="6" fill={M} />
      <rect x="160" y="50" width="26" height="54" rx="13" fill="#3A3D44" transform="rotate(-10 173 77)" />
    </>
  ),

  aro_luz: ({ base, M }) => (
    <>
      <path d="M120 112L86 168M120 112L154 168M120 112V168" stroke={base} strokeWidth="4" />
      <rect x="117" y="84" width="6" height="30" fill={M} />
      <circle cx="120" cy="62" r="50" fill="none" stroke="#FFF6D6" strokeWidth="16" />
      <circle cx="120" cy="62" r="50" fill="none" stroke="#fff" strokeWidth="6" />
      <circle cx="120" cy="62" r="58" fill="none" stroke={base} strokeWidth="2" />
      <circle cx="120" cy="62" r="42" fill="none" stroke={base} strokeWidth="2" />
      <rect x="108" y="40" width="24" height="44" rx="5" fill="#222" />
      <circle cx="120" cy="62" r="68" fill="#FFF3B0" opacity=".15" />
    </>
  ),

  monitor: ({ G, muy, M, marca }) => (
    <>
      <path d="M90 158H150L140 132H100Z" fill={muy} />
      <rect x="112" y="116" width="16" height="22" fill={M} />
      <rect x="26" y="18" width="188" height="110" rx="6" fill={G} />
      <rect x="31" y="22" width="178" height="98" rx="2" fill="#0F2A3A" />
      <path d="M31 92C70 70 100 100 140 74S190 64 209 70V120H31Z" fill="#1E7A6A" opacity=".9" />
      <path d="M31 104C80 90 130 112 209 92V120H31Z" fill="#2BA187" opacity=".9" />
      <circle cx="176" cy="44" r="10" fill="#F2C94C" />
      <path d="M40 26L110 26L60 116L40 116Z" fill="#fff" opacity=".06" />
      <Marca x="120" y="126" t={marca} size={5} color="#9AA" />
    </>
  ),

  brazo_monitor: ({ G, M, muy }) => (
    <>
      <rect x="40" y="140" width="40" height="20" rx="3" fill={muy} />
      <rect x="54" y="60" width="12" height="82" rx="4" fill={M} />
      <path d="M60 70L120 54L168 74" fill="none" stroke={G} strokeWidth="12" strokeLinecap="round" />
      <circle cx="60" cy="70" r="8" fill={muy} /><circle cx="120" cy="54" r="8" fill={muy} />
      <rect x="164" y="50" width="40" height="46" rx="4" fill={M} stroke={muy} />
      {[0, 1].map((i) => [0, 1].map((j) => <circle key={`${i}${j}`} cx={174 + i * 20} cy={62 + j * 22} r="3" fill={muy} />))}
    </>
  ),

  hub: ({ G, muy, M, claro, marca }) => (
    <>
      <path d="M44 112C24 112 24 84 40 70" fill="none" stroke="#333" strokeWidth="6" strokeLinecap="round" />
      <rect x="34" y="58" width="14" height="18" rx="3" fill={M} />
      <rect x="52" y="90" width="150" height="46" rx="14" fill={G} />
      {[0, 1, 2].map((i) => <rect key={i} x={140 + i * 18} y="108" width="12" height="7" rx="1.5" fill={muy} />)}
      <rect x="98" y="106" width="22" height="9" rx="2" fill={muy} />
      <rect x="74" y="108" width="14" height="5" rx="2.5" fill={muy} />
      <Brillo d="M60 96h120c-50 4-90 10-114 22-6-6-8-16-6-22z" />
      <Marca x="66" y="128" t={marca} size={6} color={claro} anchor="start" />
    </>
  ),

  webcam: ({ G, muy, M }) => (
    <>
      <path d="M100 122L92 160H148L140 122Z" fill={muy} />
      <rect x="40" y="52" width="160" height="72" rx="36" fill={G} />
      <circle cx="120" cy="88" r="26" fill="#111" stroke={M} strokeWidth="4" />
      <circle cx="120" cy="88" r="15" fill="#1D2A4A" /><circle cx="114" cy="82" r="5" fill="#8FB3FF" opacity=".7" />
      <circle cx="72" cy="88" r="4" fill="#222" /><circle cx="168" cy="88" r="4" fill="#222" />
      <circle cx="152" cy="70" r="2.5" fill="#5BE3A5" />
      <Brillo d="M52 66c30-12 90-14 130-6-50 0-94 8-122 22-6-4-10-12-8-16z" />
    </>
  ),

  ssd: ({ G, muy, claro, marca }) => (
    <>
      <path d="M190 96C214 96 216 132 200 140" fill="none" stroke="#333" strokeWidth="6" strokeLinecap="round" />
      <rect x="54" y="48" width="132" height="100" rx="18" fill={G} />
      <rect x="62" y="56" width="116" height="84" rx="12" fill="none" stroke={claro} strokeOpacity=".35" />
      <circle cx="166" cy="128" r="3" fill="#5BE3A5" />
      <Brillo d="M62 60c40-8 90-8 116-2-40 0-84 6-112 18-4-4-6-12-4-16z" />
      <Marca x="120" y="100" t={marca} size={13} color={claro} />
      <Marca x="120" y="114" t="1 TB" size={8} color={claro} />
      <rect x="100" y="146" width="40" height="4" rx="2" fill={muy} />
    </>
  ),

  usb: ({ G, M, muy, oscuro, marca }) => (
    <>
      <circle cx="190" cy="92" r="18" fill="none" stroke={M} strokeWidth="5" />
      <rect x="62" y="70" width="112" height="44" rx="10" fill={G} />
      <rect x="28" y="76" width="40" height="32" rx="3" fill={M} />
      <rect x="36" y="84" width="8" height="6" fill={muy} /><rect x="50" y="84" width="8" height="6" fill={muy} />
      <circle cx="164" cy="92" r="5" fill="#fff" stroke={oscuro} />
      <Marca x="112" y="96" t={marca} size={9} color={oscuro} />
      <Brillo d="M70 74h90c-36 4-64 10-84 20-6-4-8-14-6-20z" />
    </>
  ),

  lampara: ({ G, M, muy }) => (
    <>
      <path d="M150 64L198 160H112Z" fill="#FFF3B0" opacity=".35" />
      <rect x="44" y="140" width="76" height="20" rx="10" fill={G} />
      <circle cx="82" cy="150" r="5" fill="#5BE3A5" opacity=".8" />
      <path d="M70 142L96 60L160 54" fill="none" stroke={M} strokeWidth="7" strokeLinecap="round" />
      <circle cx="96" cy="60" r="6" fill={muy} />
      <rect x="134" y="44" width="56" height="16" rx="8" fill={G} />
      <rect x="138" y="58" width="48" height="4" rx="2" fill="#FFF8D0" />
    </>
  ),

  mochila: ({ G, oscuro, muy, M, marca, claro }) => (
    <>
      <path d="M102 32C102 16 138 16 138 32" fill="none" stroke={muy} strokeWidth="7" />
      <rect x="68" y="30" width="104" height="132" rx="34" fill={G} />
      <rect x="82" y="98" width="76" height="54" rx="16" fill={oscuro} />
      <path d="M86 102H154" stroke={M} strokeWidth="2.5" />
      <path d="M78 50C110 44 130 44 162 50" fill="none" stroke={M} strokeWidth="2.5" />
      <rect x="150" y="96" width="6" height="12" rx="2" fill={M} />
      <Brillo d="M78 46c10-10 24-14 40-14-14 6-26 22-32 46-8-8-12-22-8-32z" />
      <Marca x="120" y="132" t={marca} size={7} color={claro} />
    </>
  ),

  mochila_deporte: (c) => (
    <>
      {DIBUJOS.mochila(c)}
      <path d="M68 80H172" stroke="#fff" strokeWidth="4" opacity=".6" />
    </>
  ),

  funda_portatil: ({ G, oscuro, M, marca, claro }) => (
    <>
      <rect x="30" y="50" width="180" height="106" rx="14" fill={G} />
      <path d="M36 58H204" stroke={M} strokeWidth="3" />
      <rect x="196" y="54" width="10" height="16" rx="3" fill={M} />
      <rect x="60" y="88" width="120" height="50" rx="8" fill={oscuro} opacity=".45" />
      <Brillo d="M38 66c50-6 120-6 162 0-60 0-118 8-150 22-8-6-14-16-12-22z" />
      <Marca x="120" y="118" t={marca} size={9} color={claro} />
    </>
  ),

  freidora: ({ G, muy, M, oscuro }) => (
    <>
      <path d="M62 60C62 30 178 30 178 60V150C178 158 172 162 164 162H76C68 162 62 158 62 150Z" fill={G} />
      <rect x="74" y="86" width="92" height="66" rx="10" fill={oscuro} />
      <rect x="106" y="112" width="28" height="10" rx="5" fill={M} />
      <ellipse cx="120" cy="58" rx="26" ry="12" fill="#0B0D0E" />
      <text x="120" y="62" fill="#5BE3A5" fontSize="10" fontFamily="Arial" fontWeight="700" textAnchor="middle">180°</text>
      <path d="M86 36h68" stroke={muy} strokeWidth="3" strokeLinecap="round" />
      <Brillo d="M70 44c10-10 30-14 50-14-20 6-36 20-44 44-6-10-10-22-6-30z" />
    </>
  ),

  papel: ({ base, oscuro }) => (
    <>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <ellipse cx="120" cy={142 - i * 12} rx="70" ry="18" fill={i === 3 ? base : tono(base, -0.08 * (3 - i))} stroke={oscuro} strokeOpacity=".4" strokeDasharray="3 2" />
        </g>
      ))}
      <ellipse cx="120" cy="106" rx="52" ry="12" fill={tono(base, 0.25)} />
    </>
  ),

  cafetera: ({ G, muy, M, oscuro, marca, claro }) => (
    <>
      <rect x="60" y="26" width="120" height="134" rx="18" fill={G} />
      <rect x="60" y="26" width="120" height="26" rx="12" fill={muy} />
      <rect x="74" y="64" width="92" height="76" rx="8" fill="#151515" />
      <rect x="112" y="62" width="16" height="16" rx="3" fill={M} />
      <rect x="70" y="140" width="100" height="10" rx="3" fill={M} />
      <path d="M104 106H134V130C134 136 104 136 104 130Z" fill="#fff" />
      <path d="M134 112C144 112 144 124 134 124" fill="none" stroke="#fff" strokeWidth="3" />
      <path d="M112 92c-4 6 4 8 0 14M124 90c-4 6 4 8 0 14" stroke="#ccc" strokeWidth="1.5" fill="none" opacity=".6" />
      <circle cx="158" cy="39" r="4" fill="#5BE3A5" />
      <Marca x="80" y="43" t={marca} size={8} color={claro} anchor="start" />
      <Brillo d="M66 58c6-4 10-4 14-4-4 20-4 60 0 96-10-30-16-70-14-92z" />
    </>
  ),

  molinillo: ({ G, V, M, muy }) => (
    <>
      <rect x="80" y="84" width="80" height="76" rx="14" fill={G} />
      <path d="M84 84C84 40 156 40 156 84Z" fill={V} stroke="#9AA" />
      <circle cx="120" cy="70" r="6" fill="#6B4A2B" /><circle cx="110" cy="76" r="5" fill="#7B5532" /><circle cx="130" cy="76" r="5" fill="#5A3B20" />
      <rect x="112" y="116" width="16" height="10" rx="3" fill={M} />
      <rect x="80" y="150" width="80" height="10" rx="5" fill={muy} />
    </>
  ),

  espumador: ({ G, M, muy }) => (
    <>
      <ellipse cx="120" cy="154" rx="46" ry="10" fill={muy} />
      <path d="M86 50H154L148 144H92Z" fill={G} />
      <path d="M154 64C182 64 182 120 150 120" fill="none" stroke={muy} strokeWidth="10" strokeLinecap="round" />
      <path d="M86 50L74 40H160L154 50Z" fill={M} />
      <ellipse cx="120" cy="48" rx="32" ry="5" fill="#fff" />
      <Brillo d="M94 60c4 20 4 60 0 80-4-20-4-60 0-80z" />
    </>
  ),

  sartenes: ({ G, muy, M }) => (
    <>
      {[[80, 72, 30], [116, 94, 38], [154, 116, 46]].map(([cx, cy, r], i) => (
        <g key={i}>
          <rect x={cx - r - 44} y={cy - 5} width="48" height="10" rx="5" fill="#1A1A1A" transform={`rotate(18 ${cx - r} ${cy})`} />
          <circle cx={cx} cy={cy} r={r} fill={muy} />
          <circle cx={cx} cy={cy} r={r - 5} fill={G} />
          <circle cx={cx} cy={cy} r={r - 14} fill="none" stroke={M} strokeOpacity=".25" />
        </g>
      ))}
    </>
  ),

  tablas: ({ base, oscuro, claro }) => (
    <>
      {[[46, 104, 150, 50], [56, 82, 130, 46], [66, 62, 110, 42]].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} rx="10" fill={tono(base, i * 0.08)} stroke={oscuro} strokeOpacity=".4" />
          <path d={`M${x + 12} ${y + h / 2}C${x + w / 3} ${y + h / 2 - 6} ${x + w / 2} ${y + h / 2 + 6} ${x + w - 30} ${y + h / 2}`} stroke={oscuro} strokeOpacity=".3" fill="none" />
          <circle cx={x + w - 16} cy={y + h / 2} r="5" fill={claro} stroke={oscuro} strokeOpacity=".5" />
        </g>
      ))}
    </>
  ),

  batidora: ({ G, V, muy, M }) => (
    <>
      <path d="M78 116H162L154 160H86Z" fill={G} />
      <circle cx="120" cy="140" r="7" fill={muy} />
      <path d="M84 40H156L146 116H94Z" fill={V} stroke="#90A4AE" />
      <path d="M156 52C178 52 178 98 152 98" fill="none" stroke="#90A4AE" strokeWidth="6" />
      <rect x="80" y="30" width="80" height="12" rx="5" fill={muy} />
      <path d="M100 108L140 104M110 98L130 114" stroke={M} strokeWidth="4" strokeLinecap="round" />
      <path d="M96 70H144L142 106H98Z" fill="#E9A9B5" opacity=".55" />
    </>
  ),

  robot: ({ G, muy, M, oscuro, marca }) => (
    <>
      <ellipse cx="120" cy="126" rx="96" ry="34" fill={muy} />
      <ellipse cx="120" cy="118" rx="96" ry="34" fill={G} stroke={oscuro} strokeOpacity=".3" />
      <ellipse cx="120" cy="104" rx="22" ry="9" fill="#2A2A2A" />
      <ellipse cx="120" cy="100" rx="22" ry="8" fill="#3A3A3A" />
      <path d="M40 120C60 140 180 140 200 120" fill="none" stroke={M} strokeWidth="3" opacity=".7" />
      <circle cx="120" cy="128" r="4" fill="#5BE3A5" />
      <Brillo d="M50 106c30-16 100-20 140-8-60-4-110 4-136 18-4-4-6-8-4-10z" />
      <Marca x="120" y="145" t={marca} size={6} color={oscuro} />
    </>
  ),

  recambios: ({ M, base, oscuro }) => (
    <>
      <rect x="40" y="70" width="70" height="60" rx="6" fill="#F5F5F5" stroke={oscuro} strokeOpacity=".4" />
      {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${46 + i * 7} 74V126`} stroke={oscuro} strokeOpacity=".35" />)}
      <g transform="translate(160 76)">
        {Array.from({ length: 6 }).map((_, i) => <path key={i} d="M0 0L0 -30" stroke="#C0392B" strokeWidth="3" transform={`rotate(${i * 60})`} />)}
        <circle r="8" fill={M} />
      </g>
      <rect x="120" y="118" width="86" height="34" rx="8" fill={base} stroke={oscuro} strokeOpacity=".3" />
      {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M${126 + i * 8} 124V146`} stroke={oscuro} strokeOpacity=".2" />)}
    </>
  ),

  bombilla: ({ M, muy, uid }) => (
    <>
      <circle cx="120" cy="66" r="62" fill="#FFE27A" opacity=".18" />
      <defs>
        <radialGradient id={`${uid}-foco`} cx=".4" cy=".35">
          <stop offset="0" stopColor="#FFF8DC" /><stop offset=".5" stopColor="#FFB86B" /><stop offset="1" stopColor="#C05BFF" />
        </radialGradient>
      </defs>
      <path d="M120 18C150 18 168 40 168 64C168 84 150 96 146 114H94C90 96 72 84 72 64C72 40 90 18 120 18Z" fill={`url(#${uid}-foco)`} />
      <rect x="94" y="114" width="52" height="10" rx="3" fill="#F5F5F5" />
      {[0, 1, 2].map((i) => <rect key={i} x="98" y={126 + i * 9} width="44" height="7" rx="3" fill={M} />)}
      <path d="M108 154H132L126 164H114Z" fill={muy} />
      <Brillo d="M92 40c8-12 20-16 30-16-10 6-18 18-20 34-6-4-12-12-10-18z" />
    </>
  ),

  enchufe: ({ G, muy, oscuro }) => (
    <>
      {[[44, 50], [124, 62]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="74" height="90" rx="20" fill={G} stroke={oscuro} strokeOpacity=".25" />
          <circle cx={x + 37} cy={y + 42} r="22" fill={tono('#F7F7F7', -0.06)} />
          <circle cx={x + 29} cy={y + 42} r="3.5" fill={muy} /><circle cx={x + 45} cy={y + 42} r="3.5" fill={muy} />
          <circle cx={x + 37} cy={y + 76} r="3" fill="#2D9CDB" />
        </g>
      ))}
    </>
  ),

  humidificador: ({ G, muy, V }) => (
    <>
      <path d="M100 30c-10-10 4-20 12-12M120 22c-8-12 10-18 14-8M140 32c-6-10 10-16 12-4" fill="none" stroke="#B8D7E8" strokeWidth="5" strokeLinecap="round" opacity=".8" />
      <rect x="112" y="34" width="16" height="12" rx="4" fill={muy} />
      <path d="M76 52C76 42 164 42 164 52V150C164 158 158 162 150 162H90C82 162 76 158 76 150Z" fill={V} stroke="#90B4C4" />
      <path d="M78 96H162V150C162 156 158 160 150 160H90C82 160 78 156 78 150Z" fill={G} opacity=".85" />
      <rect x="76" y="140" width="88" height="22" rx="8" fill="#F5F5F5" />
      <circle cx="120" cy="151" r="4" fill="#5BE3A5" />
    </>
  ),

  esterilla: ({ G, oscuro, muy, base }) => (
    <>
      <rect x="30" y="76" width="160" height="64" rx="8" fill={G} />
      <ellipse cx="190" cy="108" rx="22" ry="32" fill={base} />
      <path d="M190 108m-16 0a16 24 0 1 0 32 0a12 18 0 1 0 -24 0a8 12 0 1 0 16 0" fill="none" stroke={muy} strokeWidth="2.5" />
      <rect x="70" y="72" width="12" height="72" rx="3" fill={oscuro} />
      <rect x="140" y="72" width="12" height="72" rx="3" fill={oscuro} />
    </>
  ),

  bandas: () => (
    <>
      {[['#E76F51', 70, 104, -10], ['#F4A261', 104, 96, 8], ['#2A9D8F', 136, 106, -6], ['#264653', 168, 98, 12], ['#E9C46A', 120, 124, 0]].map(([col, cx, cy, rot], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="40" ry="24" fill="none" stroke={col} strokeWidth="9" transform={`rotate(${rot} ${cx} ${cy})`} />
      ))}
    </>
  ),

  botella: ({ H, muy, M, marca, claro }) => (
    <>
      <rect x="98" y="16" width="44" height="22" rx="6" fill={muy} />
      <path d="M108 16C108 6 132 6 132 16" fill="none" stroke={muy} strokeWidth="4" />
      <rect x="102" y="36" width="36" height="6" fill={M} />
      <rect x="92" y="42" width="56" height="120" rx="16" fill={H} />
      <rect x="92" y="78" width="56" height="4" fill={claro} opacity=".5" />
      <Marca x="120" y="120" t={marca} size={8} color={claro} />
    </>
  ),

  mancuernas: ({ M, muy, oscuro }) => (
    <>
      {[0, 1].map((k) => {
        const y = 72 + k * 54
        const dx = k * 14
        return (
          <g key={k}>
            <rect x={60 + dx} y={y - 5} width="120" height="10" rx="5" fill={M} />
            {[[54, 24], [66, 20], [162, 20], [174, 24]].map(([x, h], i) => (
              <rect key={i} x={x + dx - 6} y={y - h} width="12" height={h * 2} rx="4" fill={i % 3 === 0 ? oscuro : muy} />
            ))}
            <rect x={98 + dx} y={y - 6} width="44" height="12" rx="4" fill="#3A3A3A" />
          </g>
        )
      })}
    </>
  ),

  rodillo: ({ G, oscuro, base }) => (
    <>
      <rect x="40" y="70" width="150" height="72" rx="10" fill={G} />
      {Array.from({ length: 7 }).map((_, i) => Array.from({ length: 3 }).map((_, j) => (
        <rect key={`${i}${j}`} x={52 + i * 19} y={80 + j * 20} width="12" height="12" rx="3" fill={oscuro} opacity=".45" />
      )))}
      <ellipse cx="190" cy="106" rx="18" ry="36" fill={base} />
      <ellipse cx="190" cy="106" rx="9" ry="18" fill={oscuro} />
    </>
  ),

  rascador: ({ base, oscuro, claro, muy }) => (
    <>
      <rect x="42" y="148" width="156" height="14" rx="4" fill={oscuro} />
      {[[70, 70], [150, 40]].map(([x, top], i) => (
        <g key={i}>
          <rect x={x} y={top} width="18" height={148 - top} fill="#D9C29E" />
          {Array.from({ length: Math.floor((148 - top) / 6) }).map((_, j) => <path key={j} d={`M${x} ${top + j * 6 + 3}H${x + 18}`} stroke="#B89B6E" strokeWidth="1.5" />)}
        </g>
      ))}
      <rect x="40" y="58" width="80" height="12" rx="4" fill={base} />
      <rect x="126" y="28" width="66" height="12" rx="4" fill={base} />
      <rect x="112" y="92" width="70" height="56" rx="8" fill={base} />
      <circle cx="146" cy="122" r="16" fill={muy} />
      <path d="M140 28c-4-12 10-14 10-4" fill={claro} />
      <circle cx="98" cy="70" r="4" fill="#E76F51" /><path d="M98 70V86" stroke="#555" />
    </>
  ),

  comedero: ({ G, muy, oscuro }) => (
    <>
      <path d="M70 46C70 26 170 26 170 46V140H70Z" fill={G} stroke={oscuro} strokeOpacity=".3" />
      <rect x="84" y="56" width="72" height="30" rx="6" fill="#1D2321" />
      <text x="120" y="76" fill="#5BE3A5" fontSize="12" fontFamily="Arial" fontWeight="700" textAnchor="middle">08:00</text>
      <ellipse cx="120" cy="146" rx="62" ry="14" fill={muy} />
      <ellipse cx="120" cy="142" rx="44" ry="9" fill="#8A5A2B" />
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={104 + i * 8} cy={141 - (i % 2) * 2} r="3" fill="#6B4320" />)}
      <circle cx="120" cy="112" r="6" fill={muy} />
    </>
  ),

  juguete: ({ G, muy, base }) => (
    <>
      <path d="M120 100Q150 40 190 30" fill="none" stroke="#999" strokeWidth="2" />
      <path d="M190 30c10-6 22 0 18 10-6-2-12 0-16 6-4-4-6-10-2-16z" fill="#2D9CDB" />
      <path d="M186 36c8 2 12 10 6 16-2-6-6-8-12-8 2-4 4-6 6-8z" fill="#F2C94C" />
      <ellipse cx="120" cy="140" rx="60" ry="20" fill={muy} />
      <path d="M60 140C60 96 180 96 180 140Z" fill={G} />
      <circle cx="120" cy="104" r="10" fill={base} stroke="#fff" strokeWidth="3" />
      <Brillo d="M76 124c14-14 40-20 60-18-24 4-44 12-56 24z" />
    </>
  ),
}
