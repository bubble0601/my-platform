import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Song {
  @Field(() => ID)
  id: number
  title: string
  createdAt: Date
}
