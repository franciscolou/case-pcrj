import { describe, it, expect, beforeEach } from 'vitest'
import { setAuth, getToken, getUser, isAuthenticated, clearAuth } from '@/lib/auth'

const FAKE_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.test.sig'
const FAKE_USER = { email: 'tecnico@prefeitura.rio', preferred_username: 'tecnico@prefeitura.rio' }

describe('auth helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('setAuth / getToken / getUser', () => {
    it('stores token and retrieves it', () => {
      setAuth(FAKE_TOKEN, FAKE_USER)
      expect(getToken()).toBe(FAKE_TOKEN)
    })

    it('stores user object and retrieves it parsed', () => {
      setAuth(FAKE_TOKEN, FAKE_USER)
      expect(getUser()).toEqual(FAKE_USER)
    })
  })

  describe('isAuthenticated', () => {
    it('returns false when nothing is stored', () => {
      expect(isAuthenticated()).toBe(false)
    })

    it('returns true after setAuth', () => {
      setAuth(FAKE_TOKEN, FAKE_USER)
      expect(isAuthenticated()).toBe(true)
    })
  })

  describe('clearAuth', () => {
    it('removes token and user from storage', () => {
      setAuth(FAKE_TOKEN, FAKE_USER)
      clearAuth()
      expect(getToken()).toBeNull()
      expect(getUser()).toBeNull()
      expect(isAuthenticated()).toBe(false)
    })
  })
})
