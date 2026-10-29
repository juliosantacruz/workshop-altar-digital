// Donde se guarda el altar.
//
// ---------------------------------------------------------------------
//  ESTE ES EL UNICO ARCHIVO QUE CAMBIA EN EL MODULO 3.
// ---------------------------------------------------------------------
//
// Antes todo vivia en el localStorage de ESTE navegador. Ahora este archivo
// le habla a TU propia API: los elementos viven en DynamoDB y las imagenes
// en un bucket privado de S3.
//
// Las cuatro funciones de abajo (`listar`, `agregar`, `borrar`,
// `urlDeImagen`) mantienen su firma y siguen siendo async, asi que ningun
// componente se toca ni una linea. Eso es a proposito: cuando la frontera
// entre tu app y donde viven los datos cabe en un archivo, cambiar de
// localStorage a una base de datos es un cambio chico y facil de revisar.
//
// Por eso `agregar` recibe el File crudo de la imagen y lo procesa AQUI: la
// version de nube lo reduce a Blob y lo sube a S3 con una URL firmada, y
// guarda solo la `imageKey` en el elemento.

import { reducirABlob } from '../lib/imagen.js'

// Este archivo ahora habla con la API. El banner de la pagina lee este dato,
// asi que tiene que decir la verdad de lo que ESTE archivo hace.
export const MODO = 'nube'

// La URL de la API sale del entorno (nunca escrita en el codigo) y se
// normaliza sin diagonal final, para armar las rutas sin dobles //.
const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

// El altar se identifica con el hostname de la pagina. La URL de Amplify
// identifica el altar, asi que la laptop y el telefono consultan la misma
// particion.
const ALTAR_ID = window.location.hostname

const LLAVE = 'ofrenda:elementos'
const LLAVE_NOMBRE = 'ofrenda:nombre'

// En la primera carga importamos lo que haya en localStorage una sola vez.
const LLAVE_IMPORTADO = 'ofrenda:importado'

async function pedir(ruta, opciones) {
  const res = await fetch(`${API}${ruta}`, opciones)
  if (!res.ok) {
    let detalle = ''
    try {
      detalle = (await res.json()).error || ''
    } catch {
      /* el cuerpo no era JSON */
    }
    throw new Error(detalle || `La API respondio ${res.status}.`)
  }
  return res.json()
}

/** Todos los elementos del altar, ordenados por cuando se pusieron. */
export async function listar() {
  const { elementos } = await pedir(`/elements?altarId=${encodeURIComponent(ALTAR_ID)}`)
  const lista = Array.isArray(elementos) ? elementos : []

  // Primera carga desde la laptop: si la API esta vacia, importamos lo que
  // ya existe en localStorage (incluidas las imagenes guardadas como data
  // URL) para que el altar no empiece en blanco.
  if (lista.length === 0 && !localStorage.getItem(LLAVE_IMPORTADO)) {
    const importados = await importarDeLocalStorage()
    if (importados.length) return importados
  }

  return lista
}

/** Lee el altar local guardado en localStorage, si lo hay. */
function leerLocal() {
  try {
    const crudo = localStorage.getItem(LLAVE)
    if (!crudo) return []
    const lista = JSON.parse(crudo)
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

/**
 * Sube a la nube los elementos que estaban en localStorage. Si uno trae
 * `imagenLocal` (una data URL), la convierte a Blob, la sube con una URL
 * firmada y guarda la `imageKey`. Devuelve la lista ya guardada por la API.
 */
async function importarDeLocalStorage() {
  const locales = leerLocal()
  localStorage.setItem(LLAVE_IMPORTADO, '1')
  if (!locales.length) return []

  const guardados = []
  for (const local of locales) {
    const { imagenLocal, id, creadoEn, posicion, sk, ...resto } = local
    const datos = { ...resto }
    if (imagenLocal) {
      const blob = await (await fetch(imagenLocal)).blob()
      datos.imageKey = await subirBlob(blob, blob.type || 'image/jpeg')
    }
    guardados.push(await agregar(datos))
  }
  return guardados
}

/**
 * Agrega un elemento y devuelve como quedo guardado.
 *
 * Si trae `imagen` (el File del formulario), aqui se reduce a Blob y se sube
 * a S3 con una URL firmada; en el elemento solo queda la `imageKey`. El
 * componente nunca sabe que paso con el archivo: solo lo entrega.
 */
export async function agregar(elemento) {
  const { imagen, ...resto } = elemento
  const cuerpo = { ...resto, altarId: ALTAR_ID }

  if (imagen) {
    const blob = await reducirABlob(imagen)
    cuerpo.imageKey = await subirBlob(blob, 'image/jpeg')
  }

  return pedir('/elements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
}

/**
 * Pide una URL firmada, sube el Blob directo a S3 con un PUT y devuelve la
 * imageKey. La imagen nunca pasa por la Lambda.
 */
async function subirBlob(blob, contentType) {
  const { url, imageKey } = await pedir('/uploads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ altarId: ALTAR_ID, contentType }),
  })
  const put = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  })
  if (!put.ok) throw new Error('No pude subir la imagen.')
  return imageKey
}

/** Quita un elemento del altar. */
export async function borrar(id) {
  await pedir('/elements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ altarId: ALTAR_ID, borrar: true, id }),
  })
}

/**
 * De donde sale la imagen de un elemento.
 *
 * El altar vive en la nube: si el elemento guarda una `imageKey`, aqui se
 * pide su URL firmada de lectura a la API. Si no tiene imagen, null.
 */
export async function urlDeImagen(elemento) {
  if (!elemento.imageKey) return null
  const { url } = await pedir(`/uploads/${elemento.imageKey}`)
  return url
}

/** Quien esta poniendo cosas en el altar. Se pregunta una sola vez. */
export function nombre() {
  return localStorage.getItem(LLAVE_NOMBRE) || ''
}

export function guardarNombre(valor) {
  localStorage.setItem(LLAVE_NOMBRE, valor.slice(0, 40))
}
