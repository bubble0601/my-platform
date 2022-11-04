import type { NextPage } from 'next'
import Link from 'next/link'
import { trpc } from '~/utils/trpc'

const Home: NextPage = () => {
  const { data, error, isLoading } = trpc.users.get.useQuery()
  const logout = trpc.auth.logout.useMutation()
  const handleLogout = () => {
    logout.mutate()
  }

  if (error) {
    console.error(error)
    return <div>An error occurred</div>
  }
  if (isLoading) return <div>Now loading...</div>

  return (
    <div>
      <div>{`Hello ${data.name}!`}</div>
      <Link href="/auth/login">ログイン</Link>
      <button onClick={handleLogout}>ログアウト</button>
    </div>
  )
}

export default Home
