import 'semantic-ui-css/semantic.min.css';
import 'highlight.js/styles/github.css';

import React from 'react';
import { AppProps } from 'next/app';
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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Menu fixed="top">
        <SemanticContainer>
          <Link href="/" passHref>
            <Menu.Item as="a">Blog</Menu.Item>
          </Link>

          <Link href="/profile" passHref>
            <Menu.Item as="a">Profile</Menu.Item>
          </Link>
          <Menu.Item position="right">
            <Button
              icon
              labelPosition="left"
              href="https://github.com/wildan2711/website"
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
              <Header inverted as="h4" content={profile.name} />
              <Header.Subheader content={profile.position} />
            </Grid.Column>
            <Grid.Column width={8}>
              <Header inverted as="h4" content="Contact Me" />
              <p>
                <a href={`mailto:${profile.email}`}>
                  <Icon name="mail" size="large" link />
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon
                    name="linkedin"
                    size="large"
                    rel="noopener noreferrer"
                  />
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="github" size="large" />
                </a>
                <a
                  href={profile.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="instagram" size="large" />
                </a>
              </p>
            </Grid.Column>
          </Grid>
        </SemanticContainer>
      </Segment>
    </>
  );
}

export default MyApp;
