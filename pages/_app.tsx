import 'semantic-ui-css/semantic.min.css';

import React from 'react';
import App, { Container, NextAppContext } from 'next/app';
import {
    Menu,
    Container as SemanticContainer,
    Grid,
    Header,
    Segment,
    Icon,
    Button
} from 'semantic-ui-react';
import Link from 'next/link';
import { profile } from '../data';

class MyApp extends App {
    public static async getInitialProps({
        Component,
        ctx,
        router
    }: NextAppContext) {
        let pageProps = { route: '' };

        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx);
        }

        pageProps.route = router.route;

        return { pageProps };
    }

    public render() {
        const { Component, pageProps } = this.props;

        return (
            <Container>
                <Menu fixed="top">
                    <SemanticContainer>
                        <Link href="/" passHref>
                            <Menu.Item as="a">Profile</Menu.Item>
                        </Link>

                        <Link href="/blog" passHref>
                            <Menu.Item as="a">Blog</Menu.Item>
                        </Link>
                        <Menu.Item position="right">
                            <Button
                                icon
                                labelPosition="left"
                                href="https://github.com/wildan2711/resume"
                            >
                                Source Code
                                <Icon name="github" />
                            </Button>
                        </Menu.Item>
                    </SemanticContainer>
                </Menu>
                <SemanticContainer text style={{ marginTop: '72px' }}>
                    <Component {...pageProps} />
                </SemanticContainer>
                <Segment
                    inverted
                    vertical
                    style={{ margin: '5em 0em 0em', padding: '5em 0em' }}
                >
                    <SemanticContainer textAlign="center">
                        <Grid divided inverted stackable>
                            <Grid.Column width={8}>
                                <Header
                                    inverted
                                    as="h4"
                                    content={profile.name}
                                />
                                <Header.Subheader content={profile.position} />
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <Header inverted as="h4" content="Contact Me" />
                                <p>
                                    <a href={`mailto:${profile.email}`}>
                                        <Icon name="mail" size="large" link />
                                    </a>
                                    <a href={profile.linkedin} target="_blank">
                                        <Icon name="linkedin" size="large" />
                                    </a>
                                    <a href={profile.facebook} target="_blank">
                                        <Icon name="facebook" size="large" />
                                    </a>
                                    <a href={profile.instagram} target="_blank">
                                        <Icon name="instagram" size="large" />
                                    </a>
                                </p>
                            </Grid.Column>
                        </Grid>
                    </SemanticContainer>
                </Segment>
            </Container>
        );
    }
}

export default MyApp;
