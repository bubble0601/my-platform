import { createParamDecorator, ExecutionContext, Provider, SetMetadata } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { LocalAuthGuard } from './auth.guard'

export const AuthGuardProvider: Provider = {
  provide: APP_GUARD,
  useClass: LocalAuthGuard,
}

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context)
  return ctx.getContext().req.user
})
