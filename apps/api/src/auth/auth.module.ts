import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { PrismaService } from '~/prisma.service'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { LocalStrategy } from './local.strategy'

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'local' })],
  providers: [PrismaService, AuthService, AuthResolver, LocalStrategy],
})
export class AuthModule {}
