import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator'

export class NestConfig {
  @IsInt()
  @Min(1)
  port!: number
}

export class CorsConfig {
  @IsBoolean()
  enabled!: boolean
}

export class SwaggerConfig {
  @IsBoolean()
  enabled!: boolean

  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  description!: string

  @IsString()
  version!: string

  @IsString()
  path!: string
}

export class GraphqlConfig {
  @IsBoolean()
  playgroundEnabled!: boolean

  @IsBoolean()
  debug!: boolean

  @IsString()
  @IsNotEmpty()
  schemaDestination!: string

  @IsBoolean()
  sortSchema!: boolean
}

export class SecurityConfig {
  @IsString()
  @IsNotEmpty()
  jwtAccessSecret!: string

  @IsString()
  @IsNotEmpty()
  jwtRefreshSecret!: string

  @IsString()
  @IsNotEmpty()
  expiresIn!: string

  @IsString()
  @IsNotEmpty()
  refreshIn!: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bcryptSalt?: string

  @ValidateIf((_: SecurityConfig, bcryptSalt: string) => !!bcryptSalt)
  @IsInt()
  bcryptRound!: number
}

export class Config {
  @ValidateNested()
  nest: NestConfig = new NestConfig()

  @ValidateNested()
  cors: CorsConfig = new CorsConfig()

  @ValidateNested()
  swagger: SwaggerConfig = new SwaggerConfig()

  @ValidateNested()
  graphql: GraphqlConfig = new GraphqlConfig()

  @ValidateNested()
  security: SecurityConfig = new SecurityConfig()
}
