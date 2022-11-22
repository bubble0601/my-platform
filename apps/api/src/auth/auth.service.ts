import { Injectable, UnauthorizedException } from '@nestjs/common'
import bcrypt from 'bcryptjs'
import { PrismaService } from '~/prisma.service'
import { LoginResponse } from './dto/login-response'

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async validateUser(username: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: { name: username },
    })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('ユーザー名かパスワードが間違っています')
    }
    return user
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    return {
      user: await this.validateUser(username, password),
    }
  }
}
