import type { APIRoute } from 'astro'
import { getTodoCookieOptions, TODO_AUTH_COOKIE_NAME } from '@/utils/todoAuth'

export const prerender = false

const getHost = (request: Request) => {
    const raw = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''
    const first = raw.split(',')[0]?.trim() ?? ''
    return first.split(':')[0] ?? ''
}

const getRootDomain = (host: string) => {
    if (!host) return null
    if (host === 'localhost') return null
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return null
    if (host === 'vercel.app' || host.endsWith('.vercel.app')) return null

    const parts = host.split('.').filter(Boolean)
    if (parts.length < 2) return null
    return parts.slice(-2).join('.')
}

const clearTodoAuthCookie = (cookies: any, request: Request) => {
    const base = getTodoCookieOptions()
    const expires = new Date(0)

    const host = getHost(request)
    const root = getRootDomain(host)

    const domains: Array<string | undefined> = [undefined]
    if (host) domains.push(host)
    if (root) domains.push(root)
    if (root) domains.push(`.${root}`)

    const paths = ['/', '/todo']

    for (const domain of domains) {
        for (const path of paths) {
            cookies.set(TODO_AUTH_COOKIE_NAME, '', {
                ...base,
                path,
                expires,
                maxAge: 0,
                ...(domain ? { domain } : {})
            })
        }
    }
}

export const GET: APIRoute = async ({ cookies, request, url }) => {
    clearTodoAuthCookie(cookies, request)
    const next = url.searchParams.get('next') || '/todo'
    return Response.redirect(next, 303)
}

export const POST: APIRoute = async ({ cookies, request }) => {
    clearTodoAuthCookie(cookies, request)
    return new Response(JSON.stringify({ ok: true }), {
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
        }
    })
}