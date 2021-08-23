import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import type { Config, JwtConfig } from '~/configs/config.schema'
import { PrismaModule } from '~/prisma/prisma.module'
import { AuthService } from '~/services/auth.service'
import { PasswordService } from '~/services/password.service'
import { GqlAuthGuard } from '~/guards/gql-auth.guard'
import { AuthResolver } from './auth.resolver'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService<Config>) => {
        const jwtConfig: JwtConfig = configService.get('security.jwt', {
          infer: true,
        })!
        return {
          secret: jwtConfig.accessSecret,
          signOptions: {
            expiresIn: jwtConfig.expiresIn,
          },
        }
      },
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    GqlAuthGuard,
    PasswordService,
  ],
  exports: [GqlAuthGuard],
})
export class AuthModule {}
