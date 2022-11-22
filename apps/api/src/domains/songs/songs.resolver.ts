import { Query, Resolver } from '@nestjs/graphql'
import { Song } from '~/@generated/song'
import { PrismaService } from '~/prisma.service'

@Resolver(() => Song)
export class SongsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Song], { name: 'songs' })
  async getSongs() {
    return this.prisma.song.findMany()
  }
}
