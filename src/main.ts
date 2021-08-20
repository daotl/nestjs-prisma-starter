import 'reflect-metadata'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import type {
  Config,
  CorsConfig,
  NestConfig,
  SwaggerConfig,
} from './configs/config.schema'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

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

  // Swagger Api
  if (swaggerConfig.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'Nestjs')
      .setDescription(swaggerConfig.description || 'The nestjs API description')
      .setVersion(swaggerConfig.version || '1.0')
      .build()
    const document = SwaggerModule.createDocument(app, options)

    SwaggerModule.setup(swaggerConfig.path || 'api', app, document)
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
