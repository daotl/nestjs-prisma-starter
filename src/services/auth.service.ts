import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Prisma, User } from '@prisma/client'
import { SecurityConfig } from '~/configs/config.interface'
import { PrismaService } from '~/prisma/prisma.service'
import { PasswordService } from './password.service'
import { SignupInput } from '~/resolvers/auth/dto/signup.input'
import { Token } from '~/models/token.model'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(payload: SignupInput): Promise<Token> {
    const hashedPassword = await this.passwordService.hashPassword(
      payload.password,
    )

    try {
      const user = await this.prisma.user.create({
        data: {
          ...payload,
          password: hashedPassword,
          role: 'USER',
        },
      })

      return this.generateTokens({
        userId: user.id,
      })
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${payload.email} already used.`)
      } else {
        throw new Error(e)
      }
    }
  }

  async login(email: string, password: string): Promise<Token> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`)
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    )

    if (!passwordValid) {
      throw new BadRequestException('Invalid password')
    }

    return this.generateTokens({
      userId: user.id,
    })
  }

  validateUser(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } })
  }

  getUserFromToken(token: string): Promise<User> | undefined {
    const { userId: id } = this.jwtService.decode(token) as { userId?: string }
    if (!id) {
      return undefined
    }
    return this.prisma.user.findUnique({ where: { id } }) as Promise<User>
  }

  generateTokens(payload: { userId: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    }
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload)
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security')!
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn,
    })
  }

  refreshToken(token: string): Token | undefined {
    try {
      const { userId }: { userId?: string } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      })

      return userId
        ? this.generateTokens({
            userId,
          })
        : undefined
    } catch (e) {
      throw new UnauthorizedException()
    }
  }
}
