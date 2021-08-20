import { IncomingMessage } from 'http'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import config from '~/configs/config'
import type { Config, GraphqlConfig } from '~/configs/config.schema'
import { AuthModule } from '~/resolvers/auth/auth.module'
import { UserModule } from '~/resolvers/user/user.module'
import { PostModule } from '~/resolvers/post/post.module'
import { AppController } from '~/controllers/app.controller'
import { AppService } from '~/services/app.service'
import { AppResolver } from '~/resolvers/app.resolver'
import { DateScalar } from '~/common/scalars/date.scalar'

// See: https://github.com/apollographql/apollo-server/issues/1593
type Req = { req: IncomingMessage }

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    GraphQLModule.forRootAsync({
      useFactory: async (configService: ConfigService<Config>) => {
        const graphqlConfig: GraphqlConfig = configService.get('graphql', {
          infer: true,
        })!
        return {
          installSubscriptionHandlers: true,
          buildSchemaOptions: {
            numberScalarMode: 'integer',
          },
          sortSchema: graphqlConfig.sortSchema,
          autoSchemaFile:
            graphqlConfig.schemaDestination || './src/schema.graphql',
          debug: graphqlConfig.debug,
          playground: graphqlConfig.playgroundEnabled,
          context: ({ req }: Req): Req => ({ req }),
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver, DateScalar],
})
export class AppModule {}
