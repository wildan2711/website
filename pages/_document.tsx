import Document, {
    Html,
    Head,
    Main,
    NextScript,
    NextDocumentContext
} from 'next/document'

export default class MyDocument extends Document {
    public static async getInitialProps(ctx: NextDocumentContext) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    public render() {
        return (
            <Html>
                <Head>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1"
                    />
                    <link
                        rel="stylesheet"
                        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
                    />
                    <link
                        rel="stylesheet"
                        href="https://fonts.googleapis.com/icon?family=Material+Icons"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
