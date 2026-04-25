import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Child } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcAge(dateString: string): number {
  const birth = new Date(dateString)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function hasAnyAlert(child: Child): boolean {
  return (
    (child.saude?.alertas?.length ?? 0) > 0 ||
    (child.educacao?.alertas?.length ?? 0) > 0 ||
    (child.assistencia_social?.alertas?.length ?? 0) > 0
  )
}
