import type { AppProps } from 'next/app'
import Head from 'next/head'
import { trpc } from '~/utils/trpc'

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default trpc.withTRPC(App)
