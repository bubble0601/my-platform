import { NextPage } from 'next'
import { SyntheticEvent, useId, useRef } from 'react'
import { trpc } from '~/utils/trpc'

export const Login: NextPage = () => {
  const usernameInputId = useId()
  const usernameInput = useRef<HTMLInputElement>(null)
  const passwordInputId = useId()
  const passwordInput = useRef<HTMLInputElement>(null)
  const login = trpc.auth.login.useMutation()
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!usernameInput.current || !passwordInput.current) return
    login.mutate({
      username: usernameInput.current.value,
      password: passwordInput.current.value,
    })
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
