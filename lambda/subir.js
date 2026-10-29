// POST /uploads        (firma para subir)
// GET  /uploads/{proxy+} (firma para ver)
//
// El bucket es privado. La imagen no pasa por la Lambda: el navegador pide
// una URL firmada, sube directo a S3 con un PUT, y guarda solo la imageKey.
//
// El cliente de S3 usa requestChecksumCalculation: 'WHEN_REQUIRED' para no
// firmar el checksum de un cuerpo vacío en la URL de PUT (si no, el PUT del
// navegador falla porque los bytes no coinciden con el checksum firmado).

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'node:crypto'

const s3 = new S3Client({ requestChecksumCalculation: 'WHEN_REQUIRED' })
const BUCKET = process.env.BUCKET

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function responder(statusCode, cuerpo) {
  return { statusCode, headers: CORS, body: JSON.stringify(cuerpo) }
}

// Tipos de imagen aceptados y su extensión para armar la imageKey.
const EXTENSIONES = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function handler(event) {
  const metodo = event.httpMethod

  // --- Firma de lectura (GET) ---
  if (metodo === 'GET') {
    const imageKey = event.pathParameters?.proxy
    if (!imageKey) {
      return responder(400, { error: 'Falta imageKey' })
    }
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: imageKey }),
      { expiresIn: 3600 }, // 1 hora
    )
    return responder(200, { url })
  }

  // --- Firma de subida (POST) ---
  const cuerpo = JSON.parse(event.body || '{}')
  const { altarId, contentType } = cuerpo

  if (!altarId) {
    return responder(400, { error: 'Falta altarId' })
  }

  const ext = EXTENSIONES[contentType]
  if (!ext) {
    return responder(400, { error: 'El contentType no es una imagen válida' })
  }

  const imageKey = `${altarId}/${randomUUID()}.${ext}`
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: imageKey, ContentType: contentType }),
    { expiresIn: 300 }, // 5 minutos
  )
  return responder(200, { url, imageKey })
}
