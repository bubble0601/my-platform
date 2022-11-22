import { Module } from '@nestjs/common'
import { PrismaService } from '~/prisma.service'
import { SongsResolver } from './songs.resolver'

@Module({
  providers: [PrismaService, SongsResolver],
})
export class SongsModule {}
