import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import styles from './styles.module.scss';
import Link from "next/link";

type Post = {
    slug: string,
    title: string,
    excerpt: string,
    updatedAt: string
}

interface PostProps {
    posts: Post[]
}

export default function Posts({ posts }) {
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>
            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map(post => (
                        // eslint-disable-next-line react/jsx-key
                        <Link key={post.slug} href={`/posts/${post.slug}`} legacyBehavior>
                            <a>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </a>
                        </Link>
                    ))}


                </div>
            </main>
        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient()

    const response = await prismic.query([
        Prismic.predicates.at('document.type', 'post')
    ], {
        fetch: ['post.title', 'post.content'],
        pageSize: 100,
    })

    //console.log(JSON.stringify(response,null,2))


    const posts = response.results.map(post => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-Br', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }

    })



    return {
        props: {
            posts
        }
    }
}