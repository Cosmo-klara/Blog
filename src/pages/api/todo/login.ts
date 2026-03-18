import type { APIRoute } from 'astro'
import { timingSafeEqual } from 'node:crypto'
import {
    createTodoAuthToken,
    getTodoCookieOptions,
    getTodoPin,
    TODO_AUTH_COOKIE_NAME
} from '@/utils/todoAuth'

export const prerender = false

export const POST: APIRoute = async ({ request, cookies }) => {
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return Response.json({ ok: false, message: 'Invalid JSON.' }, { status: 400 })
    }

    const pin = typeof (body as any)?.pin === 'string' ? ((body as any).pin as string) : ''
    if (!/^\d{4}$/.test(pin)) {
        return Response.json({ ok: false, message: 'PIN must be 4 digits.' }, { status: 400 })
    }

    const expectedPin = getTodoPin()
    if (!expectedPin) {
        return Response.json({ ok: false, message: 'TODO auth is not configured.' }, { status: 500 })
    }

    const a = Buffer.from(pin)
    const b = Buffer.from(expectedPin)
    const ok = a.length === b.length && timingSafeEqual(a, b)
    if (!ok) {
        return Response.json({ ok: false, message: 'PIN incorrect.' }, { status: 401 })
    }

    const token = createTodoAuthToken()
    if (!token) {
        return Response.json({ ok: false, message: 'TODO auth is not configured.' }, { status: 500 })
    }

    cookies.set(TODO_AUTH_COOKIE_NAME, token, getTodoCookieOptions())
    return Response.json({ ok: true })
}