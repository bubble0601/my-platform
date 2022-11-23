import bcrypt from 'bcryptjs'
import { mutationType, nonNull, objectType, stringArg } from 'nexus'

const AuthedUser = objectType({
  name: 'AuthedUser',
  definition(t) {
    t.nonNull.bigInt('id')
    t.nonNull.string('name')
  },
})

const LoginResponse = objectType({
  name: 'LoginResponse',
  definition(t) {
    t.nonNull.field('user', {
      type: AuthedUser,
    })
  },
})

export const authMutation = mutationType({
  definition(t) {
    t.field('login', {
      type: LoginResponse,
      args: {
        username: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(_, { username, password }, { db, request, reply }) {
        const user = await db.user.findFirst({
          where: { name: username },
        })
        if (!user || !(await bcrypt.compare(password, user.password))) {
          reply.code(401)
          throw new Error('ユーザー名かパスワードが間違っています')
        }
        request.session.user = user
        return { user }
      },
    })

    t.field('logout', {
      type: objectType({
        name: 'LogoutResponse',
        definition(t) {
          t.nonNull.string('result')
        },
      }),
      async resolve(_, __, { request }) {
        request.session.destroy()
        return { result: 'ok' }
      },
    })
  },
})
