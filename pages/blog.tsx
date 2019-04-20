import React from 'react';
import Head from 'next/head';
import { Header, Divider } from 'semantic-ui-react';
import { posts } from '../posts';
import { format, parse } from 'date-fns';
import Markdown from '../components/Markdown';

export default class Blog extends React.Component {
    public render() {
        return (
            <div>
                <Head>
                    <title>Blog | Wildan Maulana Syahidillah</title>
                </Head>
                {posts.map(post => (
                    <div key={post.id}>
                        <Header
                            as="h1"
                            style={{ marginBottom: '0 !important' }}
                        >
                            {post.title}
                        </Header>
                        <small>
                            {format(parse(post.created), 'dddd, D/MM/YYYY H:m')}
                        </small>
                        <Markdown source={post.text} />
                        <Divider style={{ marginBottom: '32px' }} />
                    </div>
                ))}

                <style global>
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
            </div>
        );
    }
}
