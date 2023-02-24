import { render, screen } from '@testing-library/react'
import { stripe } from '../../services/stripe'
import Posts, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { getPrismicClient } from '../../services/prismic'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

const post =
{
    slug: 'my-new-post',
    title: 'My New Post',
    content: '<p>Post excerpt</p>',
    updatedAt: '21 de fevereiro'
}


jest.mock('next-auth/react')
jest.mock('next/router')
jest.mock('../../services/prismic')


describe('Post preview page', () => {
    it('renders correctly', () => {

        const useSessionMocked = jest.mocked(useSession)


        useSessionMocked.mockReturnValue([null, false] as any)

        render(<Posts post={post} />)

        expect(screen.getByText("My New Post")).toBeInTheDocument()
        expect(screen.getByText("Post excerpt")).toBeInTheDocument()
        expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument()
    })

    it('redirects user to full post when user is subscribed', async () => {
        const useSessionMocked = jest.mocked(useSession)
        const useRouterMocked = jest.mocked(useRouter)
        const pushMock = jest.fn()

        useSessionMocked.mockReturnValueOnce({
            data: {
                user: { name: "John Doe", email: "john.doe@example.com" },
                activeSubscription: 'fake-active-subscription',
                expires: "fake-expires",
            },
            status: 'authenticated',
        })


        useRouterMocked.mockReturnValueOnce({
            push: pushMock
        } as any)

        render(<Posts post={post} />)

        expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')

    })

    it('loads initial data', async () => {

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



        const response = await getStaticProps({
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