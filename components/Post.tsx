import React from 'react';
import Link from 'next/link';
import { Header, Divider, Grid, Button } from 'semantic-ui-react';
import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import Markdown from './Markdown';
import Disqus from 'disqus-react';
import { generateUrlSEO } from '../lib/url';

interface PostProps {
  title: string;
  text: string;
  href?: string;
  created: string;
}

const disqusShortname = process.env.DISQUS_SHORTNAME || '';
const siteUrl = process.env.SITE_URL || '';

const Post = (props: PostProps) => {
  const postPath = generateUrlSEO(props.title);
  const disqusConfig = {
    url: `${siteUrl}/${postPath}`,
    identifier: postPath,
    title: props.title
  };
  return (
    <>
      <Header as="h1" style={{ marginBottom: '0 !important' }}>
        {props.title}
      </Header>
      <small>{format(parseISO(props.created), 'EEEE, dd/MM/yyyy H:m')}</small>
      <Markdown source={props.text} className="post" />
      {props.href ? (
        <>
          <Grid textAlign="right" style={{ marginTop: 8 }}>
            <Grid.Column floated="right" computer={4} mobile={8}>
              <Link href={props.href} passHref>
                <Button>Read More...</Button>
              </Link>
            </Grid.Column>
          </Grid>
          <Divider style={{ marginBottom: 32 }} />
        </>
      ) : (
        // display comments on post page
        <div className="comment-wrapper">
          <Disqus.CommentCount
            shortname={disqusShortname}
            config={disqusConfig}
          >
            Comments
          </Disqus.CommentCount>

          <Disqus.DiscussionEmbed
            shortname={disqusShortname}
            config={disqusConfig}
          />
        </div>
      )}

      <style global jsx>
        {`
          .post {
            margin-top: 16px;
            text-align: justify;
            max-width: 100vw;
          }

          .post img {
            max-width: 100%;
          }

          .comment-wrapper {
            margin-top: 16px;
          }
        `}
      </style>
    </>
  );
};

export default Post;
