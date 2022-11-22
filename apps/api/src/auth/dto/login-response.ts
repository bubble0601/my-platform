import { Field, ObjectType } from '@nestjs/graphql'
import { User } from '~/@generated/user'

@ObjectType()
export class LoginResponse {
  @Field(() => User)
  user: User
}
