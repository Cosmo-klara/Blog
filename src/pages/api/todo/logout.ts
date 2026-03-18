import type { APIRoute } from 'astro'
import { getTodoCookieOptions, TODO_AUTH_COOKIE_NAME } from '@/utils/todoAuth'

export const prerender = false

export const POST: APIRoute = async ({ cookies }) => {
    const base = getTodoCookieOptions()
    const expires = new Date(0)

    cookies.set(TODO_AUTH_COOKIE_NAME, '', { ...base, maxAge: 0, expires, path: '/' })
    cookies.delete(TODO_AUTH_COOKIE_NAME, { path: '/' })

    cookies.set(TODO_AUTH_COOKIE_NAME, '', { ...base, maxAge: 0, expires, path: '/todo' })
    cookies.delete(TODO_AUTH_COOKIE_NAME, { path: '/todo' })

    return Response.json({ ok: true })
}