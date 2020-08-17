import React from 'react';
import Head from 'next/head';
import PostComponent from '../../components/Post';
import { posts } from '../../posts';
import { GetStaticProps, GetStaticPaths } from 'next';
import { generateUrlSEO } from '../../lib/url';

interface PostPageProps {
  postId: number;
  title: string;
  created: string;
  content: string;
  description: string;
}

const PostPage = (props: PostPageProps) => {
  return (
    <>
      <Head>
        <title>{props.title} | Blog | Wildan Maulana Syahidillah</title>
        <meta name="description" content={props.description} />
      </Head>
      <PostComponent
        title={props.title || ''}
        created={props?.created || new Date().toISOString()}
        text={props.content}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps<
  any,
  {
    id: string;
    url: string;
  }
> = async context => {
  const { id, url } = context.params!;
  const post: Post = posts.find(post => post.id === Number(id)) || ({} as Post);
  const { default: postContent } = await import(`../../posts/${url}.md`);

  return {
    props: {
      postId: parseInt(id, 10),
      title: post.title,
      created: post.created,
      description: post.text,
      content: postContent
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: posts.map(post => ({
      params: {
        id: post.id.toString(),
        url: generateUrlSEO(post.title)
      }
    })),
    fallback: false
  };
};

export default PostPage;
