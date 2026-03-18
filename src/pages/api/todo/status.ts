import type { APIRoute } from 'astro'
import { TODO_AUTH_COOKIE_NAME, verifyTodoAuthToken } from '@/utils/todoAuth'

export const prerender = false

export const GET: APIRoute = async ({ cookies }) => {
    const token = cookies.get(TODO_AUTH_COOKIE_NAME)?.value
    const authed = verifyTodoAuthToken(token)
    return Response.json({ authed })
}