import React from 'react';
import Head from 'next/head';
import PostComponent from '../../components/Post';
import { posts } from '../../posts';
import { NextPageContext } from 'next';

interface PostPageProps {
    postId: number;
    title: string;
    created: string;
    content: string;
}

const Post = (props: PostPageProps) => {
    return (
        <>
            <Head>
                <title>{props.title} | Blog | Wildan Maulana Syahidillah</title>
            </Head>
            <PostComponent
                postId={props.postId}
                title={props.title || ''}
                created={props?.created || new Date().toISOString()}
                text={props.content}
            />
        </>
    );
};

Post.getInitialProps = async (
    context: NextPageContext
): Promise<PostPageProps> => {
    const { id, url } = context.query;
    const post = posts[Number(id)];
    const { default: postContent } = await import(`../../posts/${url}.md`);

    return {
        postId: parseInt(id as string, 10),
        title: post.title,
        created: post.created,
        content: postContent
    };
};

export default Post;
