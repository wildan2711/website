import React from 'react';
import Head from 'next/head';
import { posts } from '../posts';
import { generateUrlSEO } from '../lib/url';
import Post from '../components/Post';

const Blog = () => (
    <>
        <Head>
            <title>Blog | Wildan Maulana Syahidillah</title>
        </Head>
        {posts.map((post, index) => (
            <Post
                key={index}
                postId={index}
                title={post.title}
                created={post.created}
                text={post.text}
                href={`/${index}/${generateUrlSEO(post.title)}`}
            />
        ))}

        <style global jsx>
            {`
                .post {
                    margin-top: 16px;
                    text-align: justify;
                }

                .post img {
                    max-width: 100%;
                }
            `}
        </style>
    </>
);

export default Blog;
