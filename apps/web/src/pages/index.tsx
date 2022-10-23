import { trpc } from '@/utils/trpc'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  const { data, error, isLoading } = trpc.users.get.useQuery()

  if (error) return <div>An error occurred</div>
  if (isLoading) return <div>Now loading...</div>

  return <div>Hello {data.name}!</div>
}

export default Home
