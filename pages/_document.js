import Document, { Html, Head, Main, NextScript } from 'next/document'

const IS_DEV = process.env.NODE_ENV == 'development'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en" className="dark">
        <Head>
          {!IS_DEV && <script async data-api="/_abc" src="/abc.js"></script>}
          <meta
            name="description"
            content="Twitch predictions stats - Find your favorite streamer predictions statistics!"
          />
        </Head>
        <body className="bg-white dark:bg-dark-bg dark:text-gray-300">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
