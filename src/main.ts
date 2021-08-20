import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import {
  CorsConfig,
  NestConfig,
  SwaggerConfig,
} from './configs/config.interface'
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

  const configService = app.get(ConfigService)
  const nestConfig = configService.get<NestConfig>('nest')!
  const corsConfig = configService.get<CorsConfig>('cors')!
  const swaggerConfig = configService.get<SwaggerConfig>('swagger')!

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

  await app.listen(process.env['PORT'] || nestConfig.port || 3000)
}
void bootstrap()
