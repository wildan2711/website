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

const Post = (props: PostProps) => {
  const disqusShortname = process.env.DISQUS_SHORTNAME || '';
  const postPath = generateUrlSEO(props.title);
  const disqusConfig = {
    url: `${process.env.SITE_URL}/${postPath}`,
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
          <Grid>
            <Grid.Column floated="right" width={4}>
              <Link href={props.href} passHref>
                <Button>Read More...</Button>
              </Link>
            </Grid.Column>
          </Grid>
          <Divider style={{ marginBottom: '32px' }} />
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
