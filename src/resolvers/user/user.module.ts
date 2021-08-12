import { Module } from '@nestjs/common'
import { PrismaModule } from '~/prisma/prisma.module'
import { UserService } from '~/services/user.service'
import { PasswordService } from '~/services/password.service'
import { UserResolver } from './user.resolver'

@Module({
  imports: [PrismaModule],
  providers: [UserResolver, UserService, PasswordService],
})
export class UserModule {}
