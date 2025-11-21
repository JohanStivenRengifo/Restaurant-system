/**
 * Utilidades para el sistema
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'COP'): string {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  } catch (error) {
    // Fallback si hay problemas con el formato
    return `$${amount.toLocaleString()}`
  }
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(d)
}

export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d)
}

export function generateId(): string {
    return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
    const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function calculateAge(birthDate: Date | string): number {
    const today = new Date()
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }

    return age
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

export function parseSearchParams(searchParams: URLSearchParams): Record<string, string> {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
        params[key] = value
    })
    return params
}

export function buildSearchParams(params: Record<string, any>): URLSearchParams {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            searchParams.set(key, String(value))
        }
    })
    return searchParams
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function retry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T> {
    return fn().catch(async (error) => {
        if (retries > 0) {
            await sleep(delay)
            return retry(fn, retries - 1, delay)
        }
        throw error
    })
}

export function isClient(): boolean {
    return typeof window !== 'undefined'
}

export function isServer(): boolean {
    return typeof window === 'undefined'
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return 'Error desconocido'
}

export function createApiResponse<T>(
    success: boolean,
    data?: T,
    message?: string,
    error?: string
) {
    return {
        success,
        data,
        message,
        error
    }
}

export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
) {
    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    }
}

export function calculatePagination(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return {
        totalPages,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null
    }
}

export function sortBy<T>(
    array: T[],
    key: keyof T,
    direction: 'asc' | 'desc' = 'asc'
): T[] {
    return [...array].sort((a, b) => {
        const aVal = a[key]
        const bVal = b[key]

        if (aVal < bVal) return direction === 'asc' ? -1 : 1
        if (aVal > bVal) return direction === 'asc' ? 1 : -1
        return 0
    })
}

export function groupBy<T, K extends keyof T>(
    array: T[],
    key: K
): Record<string, T[]> {
    return array.reduce((groups, item) => {
        const group = String(item[key])
        groups[group] = groups[group] || []
        groups[group].push(item)
        return groups
    }, {} as Record<string, T[]>)
}

export function filterBy<T>(
    array: T[],
    filters: Partial<T>
): T[] {
    return array.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (value === undefined || value === null) return true
            return item[key as keyof T] === value
        })
    })
}

export function searchInArray<T>(
    array: T[],
    searchTerm: string,
    searchFields: (keyof T)[]
): T[] {
    if (!searchTerm) return array

    const term = searchTerm.toLowerCase()
    return array.filter(item => {
        return searchFields.some(field => {
            const value = item[field]
            if (typeof value === 'string') {
                return value.toLowerCase().includes(term)
            }
            if (typeof value === 'number') {
                return value.toString().includes(term)
            }
            return false
        })
    })
}
