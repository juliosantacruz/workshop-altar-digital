// Arte por default de cada tipo de elemento.
//
// Son SVG escritos a mano, no archivos de imagen, por tres razones:
// pesan poquisimo, se ven nitidos en cualquier pantalla, y los puedes
// recolorear cambiando una linea. Todos usan el mismo viewBox de 100x100
// para que midan igual en el altar.
//
// Si un elemento trae su propia imagen (imageKey), esa gana y el arte de
// aqui no se usa.

const NARANJA = '#E8713C'
const NARANJA_CLARO = '#F2A33C'
const OXIDO = '#C1440E'
const VERDE = '#4A7C59'
const CREMA = '#F6F2E9'
const OSCURO = '#1A1420'
const MORADO = '#7A3B69'
const TURQUESA = '#3D8B91'
const ROSA = '#E05B7F'
const AMARILLO = '#F2CB5B'
const AZUL = '#4A6FA5'

function svg(contenido) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${contenido}</svg>`
}

// Reparte n copias de una forma en circulo alrededor de un centro.
function enCirculo(n, radio, cx, cy, forma) {
  return Array.from({ length: n }, (_, i) => {
    const giro = (360 / n) * i
    return `<g transform="rotate(${giro} ${cx} ${cy})">${forma(radio, cx, cy)}</g>`
  }).join('')
}

const petalo = (radio, cx, cy) =>
  `<ellipse cx="${cx}" cy="${cy - radio}" rx="7" ry="11" />`

export const ARTE = {
  // Flor de cempasuchil. Su olor y su color guian a las animas.
  cempasuchil: svg(`
    <path d="M50 58 L50 96" stroke="${VERDE}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M50 78 q -14 -6 -18 -18 q 14 2 18 18 z" fill="${VERDE}"/>
    <g fill="${NARANJA}">${enCirculo(9, 26, 50, 48, petalo)}</g>
    <g fill="${NARANJA_CLARO}">${enCirculo(8, 16, 50, 48, petalo)}</g>
    <circle cx="50" cy="48" r="9" fill="${OXIDO}"/>
  `),

  // Vela. Alumbra el camino de regreso a casa.
  vela: svg(`
    <rect x="36" y="38" width="28" height="56" rx="4" fill="${CREMA}"/>
    <rect x="36" y="38" width="9" height="56" fill="#E6DFCE"/>
    <rect x="30" y="90" width="40" height="8" rx="3" fill="${MORADO}"/>
    <path d="M50 34 L50 24" stroke="${OSCURO}" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 6 q 11 12 11 20 a 11 11 0 0 1 -22 0 q 0 -8 11 -20 z" fill="${NARANJA_CLARO}"/>
    <path d="M50 14 q 5 7 5 12 a 5 5 0 0 1 -10 0 q 0 -5 5 -12 z" fill="${AMARILLO}"/>
  `),

  // Papel picado. La fiesta que recibe a quien llega.
  papel: svg(`
    <path d="M4 22 q 46 16 92 0" stroke="${OSCURO}" stroke-width="2.5" fill="none"/>
    <path d="M10 24 L40 30 L22 62 z" fill="${ROSA}"/>
    <path d="M38 29 L68 31 L52 66 z" fill="${TURQUESA}"/>
    <path d="M64 31 L92 23 L84 58 z" fill="${AMARILLO}"/>
    <g fill="${CREMA}">
      <circle cx="22" cy="38" r="3"/><circle cx="26" cy="47" r="2.5"/>
      <circle cx="51" cy="41" r="3"/><circle cx="54" cy="51" r="2.5"/>
      <circle cx="77" cy="36" r="3"/><circle cx="79" cy="45" r="2.5"/>
    </g>
  `),

  // Sal. Purifica y cuida el cuerpo en el camino.
  sal: svg(`
    <path d="M18 56 q 32 -22 64 0 q -6 30 -32 30 q -26 0 -32 -30 z" fill="${TURQUESA}"/>
    <path d="M24 58 q 26 -16 52 0 q -4 10 -26 10 q -22 0 -26 -10 z" fill="${CREMA}"/>
    <path d="M30 56 q 20 -24 40 0 z" fill="#FFFFFF"/>
    <g fill="#FFFFFF"><circle cx="44" cy="44" r="2"/><circle cx="56" cy="40" r="2"/><circle cx="62" cy="48" r="1.6"/></g>
  `),

  // Agua. Para la sed del camino largo.
  agua: svg(`
    <path d="M30 16 L70 16 L64 90 L36 90 z" fill="none" stroke="${CREMA}" stroke-width="3"/>
    <path d="M33 42 L67 42 L64 88 L36 88 z" fill="${AZUL}" opacity="0.75"/>
    <path d="M33 42 q 17 8 34 0 l 0 -3 q -17 8 -34 0 z" fill="#8FB8E8"/>
    <rect x="26" y="90" width="48" height="6" rx="3" fill="${MORADO}"/>
  `),

  // Pan de muerto. El pan que se comparte con quien viene.
  pan: svg(`
    <circle cx="50" cy="54" r="38" fill="#C98A4B"/>
    <circle cx="50" cy="54" r="30" fill="#E0A763"/>
    <g fill="#C98A4B">
      <path d="M50 20 q 5 14 0 28 q -5 -14 0 -28 z"/>
      <path d="M50 88 q 5 -14 0 -28 q -5 14 0 28 z"/>
      <path d="M16 54 q 14 5 28 0 q -14 -5 -28 0 z"/>
      <path d="M84 54 q -14 5 -28 0 q 14 -5 28 0 z"/>
    </g>
    <circle cx="50" cy="54" r="8" fill="#C98A4B"/>
    <g fill="${CREMA}" opacity="0.85">
      <circle cx="36" cy="38" r="1.8"/><circle cx="64" cy="40" r="1.8"/>
      <circle cx="40" cy="70" r="1.8"/><circle cx="66" cy="66" r="1.8"/>
    </g>
  `),

  // Copal. El humo que limpia el lugar.
  copal: svg(`
    <path d="M24 64 q 26 -12 52 0 q -5 26 -26 26 q -21 0 -26 -26 z" fill="${OXIDO}"/>
    <ellipse cx="50" cy="64" rx="26" ry="7" fill="#8C8C8C"/>
    <g stroke="#B9B2A4" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.9">
      <path d="M42 56 q -8 -12 0 -20 q 8 -8 2 -20"/>
      <path d="M58 56 q 9 -10 2 -19 q -7 -9 1 -19"/>
    </g>
  `),

  // Foto. La cara de quien recordamos.
  foto: svg(`
    <rect x="14" y="10" width="72" height="80" rx="4" fill="${MORADO}"/>
    <rect x="21" y="17" width="58" height="60" fill="${CREMA}"/>
    <circle cx="50" cy="40" r="13" fill="#B9AFC4"/>
    <path d="M27 77 q 8 -22 23 -22 q 15 0 23 22 z" fill="#B9AFC4"/>
    <rect x="21" y="80" width="58" height="4" rx="2" fill="${AMARILLO}"/>
  `),

  // Recuerdo. Lo que quieres dejar escrito.
  recuerdo: svg(`
    <path d="M20 12 L72 12 L84 26 L84 90 L20 90 z" fill="${CREMA}"/>
    <path d="M72 12 L84 26 L72 26 z" fill="#D8D0BC"/>
    <g stroke="#9C9382" stroke-width="3" stroke-linecap="round">
      <path d="M30 40 L72 40"/><path d="M30 52 L72 52"/>
      <path d="M30 64 L64 64"/><path d="M30 76 L52 76"/>
    </g>
  `),

  // Cancion. La que ponia cuando estaba en la cocina.
  cancion: svg(`
    <path d="M40 74 L40 24 L78 16 L78 64" stroke="${MORADO}" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <ellipse cx="30" cy="76" rx="14" ry="11" fill="${ROSA}"/>
    <ellipse cx="68" cy="66" rx="12" ry="9.5" fill="${ROSA}"/>
    <path d="M40 34 L78 26" stroke="${MORADO}" stroke-width="5" fill="none"/>
  `),

  // Comida. Su plato favorito.
  comida: svg(`
    <ellipse cx="50" cy="62" rx="40" ry="22" fill="${CREMA}"/>
    <ellipse cx="50" cy="59" rx="31" ry="16" fill="#E6DFCE"/>
    <circle cx="38" cy="56" r="9" fill="${OXIDO}"/>
    <circle cx="56" cy="52" r="7" fill="${VERDE}"/>
    <circle cx="62" cy="62" r="6" fill="${AMARILLO}"/>
    <path d="M30 62 q 20 8 40 -2" stroke="${NARANJA}" stroke-width="4" fill="none" stroke-linecap="round"/>
  `),

  // Bebida. El cafe, el atole, el tequilita.
  bebida: svg(`
    <path d="M24 34 L72 34 L68 84 q -1 6 -8 6 L40 90 q -7 0 -8 -6 z" fill="${CREMA}"/>
    <path d="M28 46 L68 46 L65 82 q 0 4 -5 4 L40 86 q -5 0 -5 -4 z" fill="#8B5E34"/>
    <path d="M72 44 q 18 2 18 14 q 0 12 -17 12" stroke="${CREMA}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <g stroke="#B9B2A4" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.8">
      <path d="M42 26 q -6 -9 0 -16"/><path d="M56 26 q 6 -9 0 -16"/>
    </g>
  `),

  // Objeto. Algo que era suyo.
  objeto: svg(`
    <rect x="18" y="38" width="64" height="52" rx="5" fill="${TURQUESA}"/>
    <rect x="18" y="38" width="64" height="12" rx="4" fill="#2F6E73"/>
    <rect x="43" y="38" width="14" height="52" fill="${AMARILLO}"/>
    <path d="M50 38 q -16 -4 -16 -14 q 0 -8 8 -8 q 8 0 8 14" fill="none" stroke="${AMARILLO}" stroke-width="6"/>
    <path d="M50 38 q 16 -4 16 -14 q 0 -8 -8 -8 q -8 0 -8 14" fill="none" stroke="${AMARILLO}" stroke-width="6"/>
  `),

  // Calaverita de azucar. Lleva su nombre en la frente.
  calaverita: svg(`
    <path d="M50 10 q 32 0 32 32 q 0 16 -8 24 l 0 12 q 0 8 -24 8 q -24 0 -24 -8 l 0 -12 q -8 -8 -8 -24 q 0 -32 32 -32 z" fill="#FFFFFF"/>
    <circle cx="36" cy="42" r="10" fill="${OSCURO}"/>
    <circle cx="64" cy="42" r="10" fill="${OSCURO}"/>
    <g fill="${ROSA}">${enCirculo(6, 15, 36, 42, (r, cx, cy) => `<circle cx="${cx}" cy="${cy - r}" r="3.4"/>`)}</g>
    <g fill="${TURQUESA}">${enCirculo(6, 15, 64, 42, (r, cx, cy) => `<circle cx="${cx}" cy="${cy - r}" r="3.4"/>`)}</g>
    <path d="M50 54 l -5 8 l 10 0 z" fill="${OSCURO}"/>
    <g stroke="${OSCURO}" stroke-width="2.5" stroke-linecap="round">
      <path d="M36 74 L64 74"/><path d="M44 70 L44 78"/><path d="M52 70 L52 78"/><path d="M60 70 L60 78"/>
    </g>
    <path d="M38 24 q 12 -8 24 0" stroke="${AMARILLO}" stroke-width="4" fill="none" stroke-linecap="round"/>
  `),

  // Control de Nintendo. Las tardes que paso jugando.
  control: svg(`
    <rect x="12" y="34" width="76" height="32" rx="4" fill="${OSCURO}"/>
    <rect x="12" y="34" width="76" height="10" rx="4" fill="#3A3340"/>
    <rect x="12" y="60" width="76" height="6" rx="3" fill="#C1440E"/>
    <g fill="${CREMA}">
      <rect x="24" y="46" width="7" height="19" rx="1"/>
      <rect x="18" y="52" width="19" height="7" rx="1"/>
    </g>
    <circle cx="32.5" cy="55.5" r="2.4" fill="#3A3340"/>
    <g fill="#6E6676">
      <rect x="46" y="52" width="8" height="5" rx="2"/>
      <rect x="57" y="52" width="8" height="5" rx="2"/>
    </g>
    <circle cx="72" cy="54" r="6" fill="${OXIDO}"/>
    <circle cx="82" cy="54" r="6" fill="${OXIDO}"/>
  `),
}

// Si algun dia alguien inventa un tipo nuevo y todavia no le dibuja arte,
// el altar no se rompe: le pone una vela.
export function arteDe(tipo) {
  return ARTE[tipo] || ARTE.vela
}
