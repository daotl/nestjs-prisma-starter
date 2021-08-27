import 'reflect-metadata'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import type {
  Config,
  CorsConfig,
  NestConfig,
  SwaggerConfig,
  SecurityConfig,
} from './configs/config.schema'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  const configService = app.get<ConfigService<Config>>(ConfigService)
  const nestConfig: NestConfig = configService.get('nest', { infer: true })!
  const corsConfig: CorsConfig = configService.get('cors', { infer: true })!
  const swaggerConfig: SwaggerConfig = configService.get('swagger', {
    infer: true,
  })!
  const securityConfig: SecurityConfig = configService.get('security', {
    infer: true,
  })!

  if (securityConfig.helmet) {
    app.use(
      helmet({
        // See `WARNING` in: https://docs.nestjs.com/security/helmet
        // `Express` and `apollo-server-express` has the same issue.
        contentSecurityPolicy: {
          directives: {
            defaultSrc: [`'self'`],
            styleSrc: [
              `'self'`,
              `'unsafe-inline'`,
              'cdn.jsdelivr.net',
              'fonts.googleapis.com',
            ],
            fontSrc: [`'self'`, 'fonts.gstatic.com'],
            imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
            scriptSrc: [`'self'`, `https: 'unsafe-inline'`, `cdn.jsdelivr.net`],
          },
        },

        crossOriginEmbedderPolicy: false,
        // TODO: Delete the following options in the next major version of Helmet
        // See: https://github.com/helmetjs/helmet#reference
        // crossOriginEmbedderPolicy, crossOriginOpenerPolicy, crossOriginResourcePolicy, and originAgentCluster are not included by default.
        // They must be explicitly enabled. They will be turned on by default in the next major version of Helmet.
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
        originAgentCluster: true,
      }),
    )
  }

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
