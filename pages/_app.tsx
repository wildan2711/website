import 'semantic-ui-css/semantic.min.css'

import React from 'react'
import App, { Container, NextAppContext } from 'next/app'

class MyApp extends App {
    public static async getInitialProps({ Component, ctx }: NextAppContext) {
        let pageProps = {}

        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx)
        }

        return { pageProps }
    }

    public render() {
        const { Component, pageProps } = this.props

        return (
            <Container>
                <Component {...pageProps} />
            </Container>
        )
    }
}

export default MyApp
