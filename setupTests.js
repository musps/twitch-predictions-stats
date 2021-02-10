import '@testing-library/jest-dom'

class LocalStorageMock {
  constructor() {
    this.store = {}
  }

  clear() {
    this.store = {}
  }

  getItem(key) {
    return this.store[key] || null
  }

  setItem(key, value) {
    this.store[key] = value
  }

  removeItem(key) {
    delete this.store[key]
  }
}

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
    }
  },
  router: {
    push: jest.fn(),
  },
}))

beforeEach(() => (global.localStorage = new LocalStorageMock()))
afterEach(() => global.localStorage.clear())
