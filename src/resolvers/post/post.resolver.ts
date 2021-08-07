import { PrismaService } from '../../prisma/prisma.service'
import { PaginationArgs } from '../../common/pagination/pagination.args'
import { PostIdArgs } from '../../models/args/post-id.args'
import { UserIdArgs } from '../../models/args/user-id.args'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql'
import { Post } from '../../models/post.model'
import { PostOrder } from '../../models/inputs/post-order.input'
import { PostConnection } from '../../models/pagination/post-connection.model'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import { PubSub } from 'graphql-subscriptions/'
import { CreatePostInput } from './dto/createPost.input'
import { UserEntity } from 'src/decorators/user.decorator'
import { User } from 'src/models/user.model'
import { GqlAuthGuard } from 'src/guards/gql-auth.guard'
import { UseGuards } from '@nestjs/common'

const pubSub = new PubSub()

@Resolver((_of: unknown) => Post)
export class PostResolver {
  constructor(private prisma: PrismaService) {}

  @Subscription((_returns) => Post)
  postCreated(): AsyncIterator<Post> {
    return pubSub.asyncIterator('postCreated')
  }

  @UseGuards(GqlAuthGuard)
  @Mutation((_returns) => Post)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
  async createPost(
    @UserEntity() user: User,
    @Args('data') data: CreatePostInput,
  ) {
    const newPost = this.prisma.post.create({
      data: {
        published: true,
        title: data.title,
        content: data.content,
        authorId: user.id,
      },
    })
    void pubSub.publish('postCreated', { postCreated: newPost })
    return newPost
  }

  @Query((_returns) => PostConnection)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
  async publishedPosts(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({
      name: 'orderBy',
      type: () => PostOrder,
      nullable: true,
    })
    orderBy: PostOrder,
  ) {
    return await findManyCursorConnection(
      (args) =>
        this.prisma.post.findMany({
          include: { author: true },
          where: {
            published: true,
            title: { contains: query || '' },
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args,
        }),
      () =>
        this.prisma.post.count({
          where: {
            published: true,
            title: { contains: query || '' },
          },
        }),
      { first, last, before, after },
    )
  }

  @Query((_returns) => [Post])
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
  userPosts(@Args() id: UserIdArgs) {
    return this.prisma.user
      .findUnique({ where: { id: id.userId } })
      .posts({ where: { published: true } })

    // or
    // return this.prisma.posts.findMany({
    //   where: {
    //     published: true,
    //     author: { id: id.userId }
    //   }
    // });
  }

  @Query((_returns) => Post)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
  async post(@Args() id: PostIdArgs) {
    return this.prisma.post.findUnique({ where: { id: id.postId } })
  }

  @ResolveField('author')
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
  async author(@Parent() post: Post) {
    return this.prisma.post.findUnique({ where: { id: post.id } }).author()
  }
}
