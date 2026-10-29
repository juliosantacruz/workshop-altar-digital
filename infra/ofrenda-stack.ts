// El stack del altar.
//
// Construye el backend del módulo 3 siguiendo design.md:
//
//   - una tabla de DynamoDB (partition key altarId, sort key sk)
//   - un bucket privado de S3 para las imágenes
//   - tres Lambdas en JavaScript plano (lambda/), montadas con Code.fromAsset
//   - una REST API con GET/POST /elements, POST /uploads y GET /uploads/{proxy+}
//
// Cada Lambda recibe permisos acotados a la tabla o al bucket concretos. No se
// agregan policies FullAccess ni permisos con Resource: '*': los grants de CDK
// generan exactamente la policy mínima para cada recurso. La policy básica que
// CDK adjunta para escribir logs en CloudWatch es esperada.

import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'

export class OfrendaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // -----------------------------------------------------------------
    // La tabla. La llave no se toca: un cambio aquí puede borrar el altar.
    // -----------------------------------------------------------------
    const tabla = new dynamodb.Table(this, 'Tabla', {
      tableName: 'ofrenda-elementos',
      partitionKey: { name: 'altarId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      // DESTROY para que `npm run limpiar` borre la tabla al cerrar el taller.
      // En un proyecto real esto sería RETAIN.
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // -----------------------------------------------------------------
    // El bucket privado de imágenes.
    // -----------------------------------------------------------------
    const bucket = new s3.Bucket(this, 'Imagenes', {
      bucketName: `ofrenda-imagenes-${cdk.Aws.ACCOUNT_ID}`,
      // Privado: una imagen solo se ve con una URL firmada.
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // Las dos juntas: sin ellas CloudFormation no puede borrar un bucket
      // con objetos dentro y el cierre del taller se rompe.
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      // CORS para el PUT firmado desde cualquier origen. La URL firmada lleva
      // la autorización; el CORS solo deja pasar el método.
      cors: [
        {
          allowedOrigins: ['*'],
          allowedMethods: [s3.HttpMethods.PUT],
          allowedHeaders: ['*'],
        },
      ],
    })

    // -----------------------------------------------------------------
    // Las tres Lambdas: JavaScript plano, sin build (Code.fromAsset).
    // -----------------------------------------------------------------
    const base = {
      runtime: lambda.Runtime.NODEJS_24_X,
      code: lambda.Code.fromAsset('lambda'),
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
    }

    const listar = new lambda.Function(this, 'Listar', {
      ...base,
      handler: 'listar.handler',
      environment: { TABLA: tabla.tableName },
    })
    tabla.grantReadData(listar)

    const agregar = new lambda.Function(this, 'Agregar', {
      ...base,
      handler: 'agregar.handler',
      environment: { TABLA: tabla.tableName },
    })
    // Escribe, y lee para contar la posición dentro del nivel.
    tabla.grantReadWriteData(agregar)

    const subir = new lambda.Function(this, 'Subir', {
      ...base,
      handler: 'subir.handler',
      environment: { BUCKET: bucket.bucketName },
    })
    // Firma URLs de subida (PUT) y de lectura (GET).
    bucket.grantPut(subir)
    bucket.grantRead(subir)

    // -----------------------------------------------------------------
    // La REST API con cuatro rutas.
    // -----------------------------------------------------------------
    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: 'ofrenda',
      deployOptions: { stageName: 'v1' },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST'],
        allowHeaders: ['Content-Type'],
      },
    })

    // /elements  -> GET (listar), POST (agregar: crear y borrar)
    const elements = api.root.addResource('elements')
    elements.addMethod('GET', new apigateway.LambdaIntegration(listar))
    elements.addMethod('POST', new apigateway.LambdaIntegration(agregar))

    // /uploads       -> POST (firma de subida)
    // /uploads/{proxy+} -> GET (firma de lectura; el imageKey lleva un '/')
    const uploads = api.root.addResource('uploads')
    uploads.addMethod('POST', new apigateway.LambdaIntegration(subir))
    const uploadsProxy = uploads.addResource('{proxy+}')
    uploadsProxy.addMethod('GET', new apigateway.LambdaIntegration(subir))

    // La base de la API, para pegarla en Amplify como VITE_API_URL.
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url })
  }
}
