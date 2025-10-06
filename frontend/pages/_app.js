import { AuthProvider } from '../contexts/AuthContext'
import '../styles/globals.css'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="App min-h-screen bg-gray-50">
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  )
}

export default MyApp