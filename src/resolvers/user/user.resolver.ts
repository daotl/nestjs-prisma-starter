import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { PrismaService } from '~/prisma/prisma.service'
import { UserService } from '~/services/user.service'
import { UserEntity } from '~/decorators/user.decorator'
import { GqlAuthGuard } from '~/guards/gql-auth.guard'
import { User } from '~/models/user.model'
import { ChangePasswordInput } from './dto/change-password.input'
import { UpdateUserInput } from './dto/update-user.input'

@Resolver((_of: unknown) => User)
@UseGuards(GqlAuthGuard)
export class UserResolver {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  @Query((_returns) => User)
  async me(@UserEntity() user: User): Promise<User> {
    return user
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((_returns) => User)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
  async updateUser(
    @UserEntity() user: User,
    @Args('data') newUserData: UpdateUserInput,
  ) {
    return this.userService.updateUser(user.id, newUserData)
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((_returns) => User)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
  async changePassword(
    @UserEntity() user: User,
    @Args('data') changePassword: ChangePasswordInput,
  ) {
    return this.userService.changePassword(
      user.id,
      user.password,
      changePassword,
    )
  }

  @ResolveField('posts')
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
  posts(@Parent() author: User) {
    return this.prisma.user.findUnique({ where: { id: author.id } }).posts()
  }
}
