// GET /elements?altarId=...
//
// Trae los elementos de UN altar con un Query por altarId (nunca un Scan),
// acotado con Limit. La sk empieza con la fecha, así que ScanIndexForward:
// true los devuelve en el orden en que se pusieron. Quita la sk de cada item
// antes de responder.

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLA = process.env.TABLA

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

function responder(statusCode, cuerpo) {
  return { statusCode, headers: CORS, body: JSON.stringify(cuerpo) }
}

export async function handler(event) {
  const altarId = event.queryStringParameters?.altarId
  if (!altarId) {
    return responder(400, { error: 'Falta altarId' })
  }

  const { Items = [] } = await doc.send(
    new QueryCommand({
      TableName: TABLA,
      KeyConditionExpression: 'altarId = :a',
      ExpressionAttributeValues: { ':a': altarId },
      ScanIndexForward: true,
      Limit: 200,
    }),
  )

  // La sk es interna: no sale en la respuesta.
  const elementos = Items.map(({ sk, ...resto }) => resto)
  return responder(200, { elementos })
}
