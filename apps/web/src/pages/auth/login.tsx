import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { SyntheticEvent, useId, useRef } from 'react'
import { useMutation } from 'urql'
import { graphql } from '~/@generated'

const loginMutation = graphql(`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      user {
        name
      }
    }
  }
`)

export const Login: NextPage = () => {
  const router = useRouter()
  const usernameInputId = useId()
  const usernameInput = useRef<HTMLInputElement>(null)
  const passwordInputId = useId()
  const passwordInput = useRef<HTMLInputElement>(null)

  const [_, login] = useMutation(loginMutation)

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!usernameInput.current || !passwordInput.current) return
    const result = await login({
      username: usernameInput.current.value,
      password: passwordInput.current.value,
    })
    if (result.data?.login?.user) {
      router.push('/')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor={usernameInputId}>ユーザー名</label>
        <input ref={usernameInput} id={usernameInputId} type="text" name="username" />
      </div>
      <div>
        <label htmlFor={passwordInputId}>パスワード</label>
        <input ref={passwordInput} id={passwordInputId} type="password" name="password" />
      </div>
      <div>
        <input type="submit" value="ログイン" />
      </div>
    </form>
  )
}

export default Login
