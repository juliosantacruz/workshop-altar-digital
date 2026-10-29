// Catalogo de tipos de elemento.
//
// Todo lo que se pone en el altar es un elemento. Una flor y una foto son
// el mismo objeto con un `tipo` distinto, igual que en un altar de verdad,
// donde todo se coloca a mano.
//
// Agregar un tipo nuevo aqui NO necesita tocar el backend: es un valor mas
// de `tipo`, su etiqueta, y su dibujo en arte.js.
//
// Cada tipo declara QUE CAMPOS PIDE. El panel del formulario se arma con
// eso, asi que una vela nunca muestra un campo de imagen: no es que se
// esconda, es que para una vela ese campo no existe.
//
//   pideTexto   un texto corto (con `ayuda` como placeholder)
//   pideLink    un link (hoy solo Spotify)
//   pideImagen  una imagen propia
//
// Un tipo que no pide nada es INSTANTANEO: al picarle en la galeria cae
// directo al altar, sin abrir panel ni pedir confirmacion.

export const TIPOS = {
  // Tradicionales: se ponen y ya, no piden nada.
  cempasuchil: { etiqueta: 'Cempasúchil', grupo: 'tradicional', nivel: 1 },
  vela: { etiqueta: 'Vela', grupo: 'tradicional', nivel: 2 },
  papel: { etiqueta: 'Papel picado', grupo: 'tradicional', nivel: 3 },
  sal: { etiqueta: 'Sal', grupo: 'tradicional', nivel: 1 },
  agua: { etiqueta: 'Agua', grupo: 'tradicional', nivel: 1 },
  pan: { etiqueta: 'Pan de muerto', grupo: 'tradicional', nivel: 2 },
  copal: { etiqueta: 'Copal', grupo: 'tradicional', nivel: 1 },

  // Personales: estos si piden algo, y por eso abren panel.
  foto: {
    etiqueta: 'Foto',
    grupo: 'personal',
    nivel: 3,
    pideTexto: true,
    ayuda: 'De quién es',
    pideImagen: true,
  },
  recuerdo: {
    etiqueta: 'Recuerdo',
    grupo: 'personal',
    nivel: 3,
    pideTexto: true,
    ayuda: 'Lo que quieras dejar escrito',
  },
  cancion: {
    etiqueta: 'Canción',
    grupo: 'personal',
    nivel: 2,
    pideTexto: true,
    ayuda: 'Título y artista',
    pideLink: true,
  },
  comida: {
    etiqueta: 'Comida',
    grupo: 'personal',
    nivel: 2,
    pideTexto: true,
    ayuda: 'Su platillo favorito',
    pideImagen: true,
  },
  bebida: { etiqueta: 'Bebida', grupo: 'personal', nivel: 2, pideTexto: true, ayuda: 'Qué tomaba' },
  objeto: {
    etiqueta: 'Objeto',
    grupo: 'personal',
    nivel: 2,
    pideTexto: true,
    ayuda: 'Algo que era suyo',
    pideImagen: true,
  },
  calaverita: {
    etiqueta: 'Calaverita',
    grupo: 'personal',
    nivel: 3,
    pideTexto: true,
    ayuda: 'El nombre que va en la frente',
  },
  control: {
    etiqueta: 'Control de Nintendo',
    grupo: 'personal',
    nivel: 2,
    pideTexto: true,
    ayuda: 'El juego con el que lo recuerdas',
  },
}

export const NIVELES = [
  { nivel: 3, nombre: 'Arriba', descripcion: 'A quién recuerdas' },
  { nivel: 2, nombre: 'En medio', descripcion: 'Lo que le gustaba' },
  { nivel: 1, nombre: 'Abajo', descripcion: 'Lo que necesita para el camino' },
]

export function etiquetaDe(tipo) {
  return TIPOS[tipo]?.etiqueta || tipo
}

export function nombreDeNivel(nivel) {
  return NIVELES.find((n) => n.nivel === nivel)?.nombre || `Nivel ${nivel}`
}

// Si un tipo no pide nada, al picarle cae directo al altar. Si pide algo,
// abre el panel con SOLO esos campos.
export function necesitaPanel(tipo) {
  const info = TIPOS[tipo]
  if (!info) return false
  return Boolean(info.pideTexto || info.pideLink || info.pideImagen)
}

export const CUPO_POR_NIVEL = 6

// El altar no arranca vacio. Esto es un set tradicional tipico, para que
// desde el primer deploy se vea vestido y nadie empiece en una pagina
// en blanco. Se puede borrar elemento por elemento.
export function setTradicional() {
  const base = [
    { tipo: 'papel', nivel: 3, posicion: 0 },
    { tipo: 'vela', nivel: 2, posicion: 0 },
    { tipo: 'pan', nivel: 2, posicion: 1 },
    { tipo: 'vela', nivel: 2, posicion: 2 },
    { tipo: 'cempasuchil', nivel: 1, posicion: 0 },
    { tipo: 'agua', nivel: 1, posicion: 1 },
    { tipo: 'sal', nivel: 1, posicion: 2 },
    { tipo: 'copal', nivel: 1, posicion: 3 },
    { tipo: 'cempasuchil', nivel: 1, posicion: 4 },
  ]
  const ahora = Date.now()
  return base.map((el, i) => ({
    ...el,
    // Las semillas se separan un milisegundo para que el orden de creacion
    // sea estable cuando se guarden en la base de datos.
    id: `semilla-${i}`,
    texto: '',
    link: '',
    puestoPor: 'el altar',
    creadoEn: new Date(ahora + i).toISOString(),
  }))
}
