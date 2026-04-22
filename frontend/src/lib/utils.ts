import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcAge(dataNascimento: string): number {
  const birth = new Date(dataNascimento)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function hasAnyAlert(child: {
  saude: { alertas: string[] } | null
  educacao: { alertas: string[] } | null
  assistencia_social: { alertas: string[] } | null
}): boolean {
  return (
    (child.saude?.alertas?.length ?? 0) +
      (child.educacao?.alertas?.length ?? 0) +
      (child.assistencia_social?.alertas?.length ?? 0) >
    0
  )
}
