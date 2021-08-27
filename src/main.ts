import 'reflect-metadata'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import type {
  Config,
  CorsConfig,
  NestConfig,
  SwaggerConfig,
} from './configs/config.schema'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        // FIXME: `redact` does not yet exist in Fastify's types
        // https://www.fastify.io/docs/latest/Logging/
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        redact: ['req.headers.authorization'],
        level: 'info',
      },
    }),
  )

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      // automatically transform payloads to be objects typed according to their DTO classes or primitive types.
      transform: true,
      // strip validated (returned) object of any properties that do not use any validation decorators.
      whitelist: true,
      // instead of stripping non-whitelisted properties validator will throw an exception.
      forbidNonWhitelisted: true,
    }),
  )

  const configService = app.get<ConfigService<Config>>(ConfigService)
  const nestConfig: NestConfig = configService.get('nest', { infer: true })!
  const corsConfig: CorsConfig = configService.get('cors', { infer: true })!
  const swaggerConfig: SwaggerConfig = configService.get('swagger', {
    infer: true,
  })!

  // Swagger API
  if (swaggerConfig.enabled) {
    const documentConfig = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'Nestjs')
      .setDescription(swaggerConfig.description || 'The nestjs API description')
      .setVersion(swaggerConfig.version || '1.0')
      .build()
    const document = SwaggerModule.createDocument(app, documentConfig, {
      // Make the library generate operation names like `createUser` instead of `UserController_createUser`
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    })

    SwaggerModule.setup(swaggerConfig.path || 'api', app, document, {
      // https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
      swaggerOptions: {
        /* Display */
        // If set to true, enables deep linking for tags and operations.
        deepLinking: true,
        // Controls the display of operationId in operations list.
        displayOperationId: true,
        // Controls the display of the request duration (in milliseconds) for "Try it out" requests.
        displayRequestDuration: true,
        // If set, enables filtering. The top bar will show an edit box that you can use to filter the tagged operations that are shown.
        filter: true,
        // Controls the display of vendor extension (x-) fields and values for Operations, Parameters, Responses, and Schema.
        showExtensions: true,
        // Controls the display of extensions (pattern, maxLength, minLength, maximum, minimum) fields and values for Parameters.
        showCommonExtensions: true,
        /* Network */
        // If set to true, enables passing credentials, as defined in the Fetch standard, in CORS requests that are sent by the browser.
        // Note that Swagger UI cannot currently set cookies cross-domain (see swagger-js#1163) - as a result,
        // you will have to rely on browser-supplied cookies (which this setting enables sending) that Swagger UI cannot control.
        withCredentials: true,
        /* Authorization */
        // If set to true, it persists authorization data and it would not be lost on browser close/refresh
        persistAuthorization: true,
      },
      customSiteTitle: 'API Documentation',
    })
  }

  // Cors
  if (corsConfig.enabled) {
    app.enableCors()
  }

  const logger = new Logger('main.ts')
  logger.log(`Start listening on: ${nestConfig.port}`)
  await app.listen(nestConfig.port)
}
void bootstrap()
