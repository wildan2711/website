import React from 'react';
import Head from 'next/head';
import posts from '../posts';
import { generateUrlSEO } from '../lib/url';
import Post from '../components/Post';

const Blog = () => (
  <>
    <Head>
      <title>Blog | Wildan Maulana Syahidillah</title>
      <meta
        name="description"
        content="Blog about software and technology by Wildan Maulana Syahidilllah"
      />
    </Head>
    {posts.map(post => (
      <Post
        key={post.id}
        title={post.title}
        created={post.created}
        text={post.text}
        href={`/${post.id}/${generateUrlSEO(post.title)}`}
      />
    ))}
  </>
);

export default Blog;
