import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'urql'
import { client } from '~/utils/urql'

function App({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no" />
      </Head>
      <Component {...pageProps} />
    </Provider>
  )
}

export default App
