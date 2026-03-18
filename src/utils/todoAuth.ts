import { createHmac, timingSafeEqual } from 'node:crypto'

export const TODO_AUTH_COOKIE_NAME = 'todo_auth'
export const TODO_AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export function getTodoPin() {
    return import.meta.env.TODO_PIN ?? process.env.TODO_PIN
}

function getTodoAuthSecret() {
    return import.meta.env.TODO_AUTH_SECRET ?? process.env.TODO_AUTH_SECRET ?? getTodoPin()
}

function sign(payload: string) {
    const secret = getTodoAuthSecret()
    if (!secret) return null
    return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createTodoAuthToken(nowSeconds = Math.floor(Date.now() / 1000)) {
    const payload = String(nowSeconds)
    const sig = sign(payload)
    if (!sig) return null
    return `${payload}.${sig}`
}

export function verifyTodoAuthToken(token: string | undefined | null) {
    if (!token) return false

    const parts = token.split('.')
    if (parts.length !== 2) return false

    const [payload, sig] = parts
    const issuedAt = Number(payload)
    if (!Number.isFinite(issuedAt)) return false

    const age = Math.floor(Date.now() / 1000) - issuedAt
    if (age < 0 || age > TODO_AUTH_COOKIE_MAX_AGE_SECONDS) return false

    const expected = sign(payload)
    if (!expected) return false

    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
}

export function getTodoCookieOptions() {
    return {
        httpOnly: true,
        secure: true,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: TODO_AUTH_COOKIE_MAX_AGE_SECONDS
    }
}