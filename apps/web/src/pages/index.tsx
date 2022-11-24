import type { NextPage } from 'next'
import Link from 'next/link'
import { useMutation, useQuery } from 'urql'
import { graphql } from '~/@generated'

const songsQuery = graphql(`
  query GetSongs {
    songs {
      title
    }
  }
`)

const logoutMutation = graphql(`
  mutation Logout {
    logout {
      result
    }
  }
`)

const Home: NextPage = () => {
  const [{ data, error }] = useQuery({ query: songsQuery })
  const [_, logout] = useMutation(logoutMutation)
  const handleLogout = async () => {
    const result = await logout({})
    console.log(result)
  }

  if (error) {
    console.error(error)
    return <div>An error occurred</div>
  }
  if (!data) return <div>Now loading...</div>

  return (
    <div>
      <div>{`Hello ${data.songs[0]?.title}!`}</div>
      <div>
        <Link href="/auth/login">ログイン</Link>
      </div>
      <button onClick={handleLogout}>ログアウト</button>
    </div>
  )
}

export default Home
