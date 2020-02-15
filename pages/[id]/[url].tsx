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

PostPage.getInitialProps = async (
    context: NextPageContext
): Promise<PostPageProps> => {
    const { id, url } = context.query;
    const post: Post =
        posts.find(post => post.id === Number(id)) || ({} as Post);
    const { default: postContent } = await import(`../../posts/${url}.md`);

    return {
        postId: parseInt(id as string, 10),
        title: post.title,
        created: post.created,
        description: post.text,
        content: postContent
    };
};

export default PostPage;
