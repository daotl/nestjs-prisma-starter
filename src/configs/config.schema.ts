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

export class JwtConfig {
  @IsString()
  @IsNotEmpty()
  accessSecret!: string

  @IsString()
  @IsNotEmpty()
  refreshSecret!: string

  @IsString()
  @IsNotEmpty()
  expiresIn!: string

  @IsString()
  @IsNotEmpty()
  refreshIn!: string
}

export class SecurityConfig {
  @ValidateNested()
  jwt = new JwtConfig()

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  passwordBcryptSalt?: string

  @ValidateIf((_: SecurityConfig, bcryptSalt: string) => !!bcryptSalt)
  @IsInt()
  passwordBcryptRound!: number
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
