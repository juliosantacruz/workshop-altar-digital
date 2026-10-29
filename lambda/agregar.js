// POST /elements  (crear y borrar, en la misma ruta)
//
// Si el cuerpo trae `borrar: true` + `id`, busca el item de ese altar con ese
// id y lo borra. Si no, crea un elemento nuevo: filtra los campos permitidos,
// cuenta cuántos hay ya en el nivel para la posicion, arma id, creadoEn y sk,
// y lo guarda.

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'node:crypto'

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLA = process.env.TABLA

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function responder(statusCode, cuerpo) {
  return { statusCode, headers: CORS, body: JSON.stringify(cuerpo) }
}

// Solo estos campos vienen del cliente. posicion se ignora y se calcula aquí;
// cualquier otro campo también se ignora.
const PERMITIDOS = ['tipo', 'nivel', 'texto', 'link', 'puestoPor', 'imageKey']

export async function handler(event) {
  const cuerpo = JSON.parse(event.body || '{}')
  const { altarId } = cuerpo

  if (!altarId) {
    return responder(400, { error: 'Falta altarId' })
  }

  // --- Borrar ---
  if (cuerpo.borrar === true) {
    const id = cuerpo.id
    if (!id) {
      return responder(400, { error: 'Falta id' })
    }
    // Buscar la sk del item: solo tenemos su id, y la llave es altarId + sk.
    const { Items = [] } = await doc.send(
      new QueryCommand({
        TableName: TABLA,
        KeyConditionExpression: 'altarId = :a',
        FilterExpression: 'id = :id',
        ExpressionAttributeValues: { ':a': altarId, ':id': id },
        Limit: 200,
      }),
    )
    const item = Items.find((el) => el.id === id)
    if (!item) {
      return responder(404, { error: 'No existe ese elemento' })
    }
    await doc.send(
      new DeleteCommand({
        TableName: TABLA,
        Key: { altarId, sk: item.sk },
      }),
    )
    return responder(200, { borrado: id })
  }

  // --- Crear ---
  if (!cuerpo.tipo) {
    return responder(400, { error: 'Falta tipo' })
  }

  // Filtrar a los campos permitidos; descartar undefined.
  const limpio = {}
  for (const campo of PERMITIDOS) {
    if (cuerpo[campo] !== undefined) limpio[campo] = cuerpo[campo]
  }

  const nivel = limpio.nivel ?? 1

  // La posicion es cuántos elementos hay ya en ese nivel de este altar.
  const { Items = [] } = await doc.send(
    new QueryCommand({
      TableName: TABLA,
      KeyConditionExpression: 'altarId = :a',
      FilterExpression: 'nivel = :n',
      ExpressionAttributeValues: { ':a': altarId, ':n': nivel },
      Limit: 200,
    }),
  )
  const posicion = Items.length

  const id = randomUUID()
  const creadoEn = new Date().toISOString()
  const sk = `${creadoEn}#${id}`

  const elemento = {
    ...limpio,
    altarId,
    nivel,
    posicion,
    id,
    creadoEn,
  }

  await doc.send(
    new PutCommand({
      TableName: TABLA,
      Item: { ...elemento, sk },
    }),
  )

  // La sk no sale en la respuesta.
  return responder(201, elemento)
}
