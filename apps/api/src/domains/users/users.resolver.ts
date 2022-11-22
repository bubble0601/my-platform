import { Resolver } from '@nestjs/graphql'
import { PrismaService } from '~/prisma.service'
import { User } from './user.model'

@Resolver(() => User)
export class UsersResolver {
  constructor(private prisma: PrismaService) {}

  // @Query(() => User)
  // async userByName(@Args('name') name: string) {
  //   return this.prisma.user.findFirst({
  //     where: { name },
  //   })
  // }
}
