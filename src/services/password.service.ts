import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { compare, hash } from 'bcrypt'
import type { Config, SecurityConfig } from '~/configs/config.schema'

@Injectable()
export class PasswordService {
  get bcryptSaltRounds(): string | number {
    const securityConfig: SecurityConfig = this.configService.get('security', {
      infer: true,
    })!
    return securityConfig.bcryptSalt || securityConfig.bcryptRound
  }

  constructor(private configService: ConfigService<Config>) {}

  validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword)
  }

  hashPassword(password: string): Promise<string> {
    return hash(password, this.bcryptSaltRounds)
  }
}
