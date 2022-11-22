import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { LoginResponse } from './dto/login-response'

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args('username') username: string, @Args('password') password: string) {
    return this.authService.login(username, password)
  }
}
