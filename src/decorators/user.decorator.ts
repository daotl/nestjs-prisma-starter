import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export const UserEntity = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
    GqlExecutionContext.create(ctx).getContext().req.user,
)
