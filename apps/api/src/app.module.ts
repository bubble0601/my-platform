import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { join } from 'path'
import { AuthModule } from './auth/auth.module'
import { configureSession } from './auth/session/session'
import { SongsModule } from './domains/songs/songs.module'
import { UsersModule } from './domains/users/users.module'
import { isProduction } from './utils/env'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      debug: !isProduction,
      playground: !isProduction,
    }),
    AuthModule,
    SongsModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    configureSession(consumer)
  }
}
