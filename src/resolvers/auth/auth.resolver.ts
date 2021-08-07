import { Auth } from '../../models/auth.model'
import { Token } from '../../models/token.model'
import { LoginInput } from './dto/login.input'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { AuthService } from '../../services/auth.service'
import { SignupInput } from './dto/signup.input'
import { RefreshTokenInput } from './dto/refresh-token.input'
import { User } from '@prisma/client'

@Resolver((_of: unknown) => Auth)
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation((_returns) => Auth)
  async signup(@Args('data') data: SignupInput): Promise<Token> {
    data.email = data.email.toLowerCase()
    const { accessToken, refreshToken } = await this.auth.createUser(data)
    return {
      accessToken,
      refreshToken,
    }
  }

  @Mutation((_returns) => Auth)
  async login(@Args('data') { email, password }: LoginInput): Promise<Token> {
    const { accessToken, refreshToken } = await this.auth.login(
      email.toLowerCase(),
      password,
    )

    return {
      accessToken,
      refreshToken,
    }
  }

  @Mutation((_returns) => Token)
  async refreshToken(
    @Args() { token }: RefreshTokenInput,
  ): Promise<Token | undefined> {
    return this.auth.refreshToken(token)
  }

  @ResolveField('user')
  async user(@Parent() auth: Auth): Promise<User | undefined> {
    return await this.auth.getUserFromToken(auth.accessToken)
  }
}
