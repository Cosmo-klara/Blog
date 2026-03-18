import type { APIRoute } from 'astro'
import { getTodoCookieOptions, TODO_AUTH_COOKIE_NAME } from '@/utils/todoAuth'

export const prerender = false

export const POST: APIRoute = async ({ cookies }) => {
    const base = getTodoCookieOptions()
    cookies.set(TODO_AUTH_COOKIE_NAME, '', { ...base, maxAge: 0 })
    cookies.delete(TODO_AUTH_COOKIE_NAME, { path: base.path })
    return Response.json({ ok: true })
}