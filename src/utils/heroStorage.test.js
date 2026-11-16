import { describe, it, expect, vi, afterEach } from 'vitest'
import { forgetHeroId, getHeroId, saveHeroId } from './heroStorage'

// Vitest runs in Node, which has no localStorage, so we provide a tiny fake
function fakeStorage() {
  const data = {}
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v)
    },
    removeItem: (k) => {
      delete data[k]
    },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('heroStorage', () => {
  it('saves, reads and forgets the id', () => {
    vi.stubGlobal('localStorage', fakeStorage())
    expect(getHeroId()).toBeNull()
    saveHeroId('abc')
    expect(getHeroId()).toBe('abc')
    forgetHeroId()
    expect(getHeroId()).toBeNull()
  })

  it('does not crash when the browser blocks storage', () => {
    const blocked = () => {
      throw new Error('blocked')
    }
    vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked, removeItem: blocked })
    expect(() => saveHeroId('abc')).not.toThrow()
    expect(getHeroId()).toBeNull()
    expect(() => forgetHeroId()).not.toThrow()
  })
})
