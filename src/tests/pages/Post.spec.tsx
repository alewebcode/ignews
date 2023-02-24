import { render, screen } from '@testing-library/react'
import { stripe } from '../../services/stripe'
import Posts, { getServerSideProps } from '../../pages/posts/[slug]'
import { getPrismicClient } from '../../services/prismic'
import { getSession } from 'next-auth/react'

const post =
{
    slug: 'my-new-post',
    title: 'My New Post',
    content: '<p>Post excerpt</p>',
    updatedAt: '21 de fevereiro'
}

jest.mock('next-auth/react')
jest.mock('../../services/prismic')

describe('Post page', () => {
    it('renders correctly', () => {
        render(<Posts post={post} />)

        expect(screen.getByText("My New Post")).toBeInTheDocument()
        expect(screen.getByText("Post excerpt")).toBeInTheDocument()
    })

    it('redirects user if no subscription is found', async () => {
        const getSessionMocked = jest.mocked(getSession)


        getSessionMocked.mockResolvedValueOnce(null)


        const response = await getServerSideProps({
            params: { slug: 'my-new-post' as any }
        } as any)

        expect(response).toEqual(
            expect.objectContaining({
                redirect: expect.objectContaining({
                    destination: "/"
                })
            })
        )

    })

    it('loads initial data', async () => {
        const getSessionMocked = jest.mocked(getSession)
        const getPrismicClientMocked = jest.mocked(getPrismicClient)

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                        { type: 'heading', text: 'My new post' }
                    ],
                    content: [
                        { type: 'paragraph', text: 'Post content' }
                    ]
                },
                last_publication_date: '02-21-2023'
            })
        } as any)

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription'
        } as any)

        const response = await getServerSideProps({
            params: { slug: 'my-new-post' as any }
        } as any)


        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'My new post',
                        content: '<p>Post content</p>',
                        updatedAt: '21 de fevereiro de 2023'
                    }
                }
            })
        )
    })
})