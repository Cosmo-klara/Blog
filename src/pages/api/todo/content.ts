import type { APIRoute } from 'astro'
import { unified } from 'unified'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

import { TODO_AUTH_COOKIE_NAME, verifyTodoAuthToken } from '@/utils/todoAuth'

export const prerender = false

const TODO_KV_KEY = 'todo:md'
const DEFAULT_TODO_MD = `

# TODO

- 整理实验记录到博客
- 补齐部署/监控说明文档
- 页面：支持更清晰的任务分组（Inbox / Doing / Done）

`

const getUpstashConfig = () => {
    const url =
        import.meta.env.KV_REST_API_URL ??
        process.env.KV_REST_API_URL ??
        import.meta.env.UPSTASH_REDIS_REST_URL ??
        process.env.UPSTASH_REDIS_REST_URL

    const token =
        import.meta.env.KV_REST_API_TOKEN ??
        process.env.KV_REST_API_TOKEN ??
        import.meta.env.UPSTASH_REDIS_REST_TOKEN ??
        process.env.UPSTASH_REDIS_REST_TOKEN

    return { url, token }
}

const isAuthed = (cookies: any) => {
    const token = cookies.get(TODO_AUTH_COOKIE_NAME)?.value
    return verifyTodoAuthToken(token)
}

const kvGet = async (key: string) => {
    const { url, token } = getUpstashConfig()
    if (!url || !token) {
        throw new Error('KV is not configured.')
    }

    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers: { authorization: `Bearer ${token}` }
    })
    const data = (await res.json().catch(() => ({}))) as any
    if (!res.ok) throw new Error(data?.error || 'KV GET failed.')
    return (data?.result ?? null) as string | null
}

const kvSet = async (key: string, value: string) => {
    const { url, token } = getUpstashConfig()
    if (!url || !token) {
        throw new Error('KV is not configured.')
    }

    const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
            authorization: `Bearer ${token}`,
            'content-type': 'text/plain; charset=utf-8'
        },
        body: value
    })
    const data = (await res.json().catch(() => ({}))) as any
    if (!res.ok) throw new Error(data?.error || 'KV SET failed.')
}

const renderMarkdown = async (md: string) => {
    const file = await unified()
        .use(remarkParse)
        .use(remarkMath)
        .use(remarkRehype)
        .use(rehypeKatex)
        .use(rehypeStringify)
        .process(md)

    return String(file)
}

export const GET: APIRoute = async ({ cookies }) => {
    if (!isAuthed(cookies)) {
        return new Response(JSON.stringify({ ok: false, message: 'Unauthorized.' }), {
            status: 401,
            headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        })
    }

    try {
        const md = (await kvGet(TODO_KV_KEY)) ?? DEFAULT_TODO_MD
        const html = await renderMarkdown(md)
        return new Response(JSON.stringify({ ok: true, markdown: md, html }), {
            headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        })
    } catch (e: any) {
        return new Response(JSON.stringify({ ok: false, message: e?.message || 'Server error.' }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        })
    }
}

export const POST: APIRoute = async ({ cookies, request }) => {
    if (!isAuthed(cookies)) {
        return new Response(JSON.stringify({ ok: false, message: 'Unauthorized.' }), {
            status: 401,
            headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        })
    }

    let body: any = null
    try {
        body = await request.json()
    } catch {
        return new Response(JSON.stringify({ ok: false, message: 'Invalid JSON.' }), {
            status: 400,
            headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        })
    }

    const markdown = typeof body?.markdown === 'string' ? body.markdown : ''
    if (!markdown.trim()) {
        return new Response(JSON.stringify({ ok: false, message: 'Markdown is empty.' }), {
            status: 400,
            headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        })
    }
    if (markdown.length > 50_000) {
        return new Response(JSON.stringify({ ok: false, message: 'Markdown too large.' }), {
            status: 413,
            headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        })
    }

    try {
        await kvSet(TODO_KV_KEY, markdown)
        const html = await renderMarkdown(markdown)
        return new Response(JSON.stringify({ ok: true, markdown, html }), {
            headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        })
    } catch (e: any) {
        return new Response(JSON.stringify({ ok: false, message: e?.message || 'Server error.' }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
        })
    }
}