import { Module } from '@nestjs/common'
import { PrismaModule } from '~/prisma/prisma.module'
import { PostResolver } from './post.resolver'

@Module({
  imports: [PrismaModule],
  providers: [PostResolver],
})
export class PostModule {}
