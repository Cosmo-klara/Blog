import type { APIRoute } from 'astro'
import { getTodoCookieOptions, TODO_AUTH_COOKIE_NAME } from '@/utils/todoAuth'

export const prerender = false

export const POST: APIRoute = async ({ cookies }) => {
    cookies.delete(TODO_AUTH_COOKIE_NAME, { path: getTodoCookieOptions().path })
    return Response.json({ ok: true })
}