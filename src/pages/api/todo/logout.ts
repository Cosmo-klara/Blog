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

const toSameSite = (v: 'lax' | 'strict' | 'none') => {
    if (v === 'strict') return 'Strict'
    if (v === 'none') return 'None'
    return 'Lax'
}

const appendClearTodoAuthCookies = (headers: Headers, request: Request) => {
    const base = getTodoCookieOptions()
    const expires = new Date(0).toUTCString()

    const host = getHost(request)
    const root = getRootDomain(host)

    const domains: Array<string | undefined> = [undefined]
    if (host) domains.push(host)
    if (root) domains.push(root)
    if (root) domains.push(`.${root}`)

    const paths = ['/', '/todo']

    for (const domain of domains) {
        for (const path of paths) {
            const parts: string[] = []
            parts.push(`${TODO_AUTH_COOKIE_NAME}=`)
            parts.push('Max-Age=0')
            parts.push(`Expires=${expires}`)
            parts.push(`Path=${path}`)
            if (domain) parts.push(`Domain=${domain}`)
            if (base.httpOnly) parts.push('HttpOnly')
            if (base.secure) parts.push('Secure')
            parts.push(`SameSite=${toSameSite(base.sameSite)}`)

            headers.append('set-cookie', parts.join('; '))
        }
    }
}

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url)
    const next = url.searchParams.get('next') || '/todo'

    const headers = new Headers({
        location: next,
        'cache-control': 'no-store'
    })
    appendClearTodoAuthCookies(headers, request)

    return new Response(null, { status: 303, headers })
}

export const POST: APIRoute = async ({ request }) => {
    const headers = new Headers({
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store'
    })
    appendClearTodoAuthCookies(headers, request)

    return new Response(JSON.stringify({ ok: true }), { headers })
}