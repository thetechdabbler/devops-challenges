describe('validateEnv', () => {
  const REQUIRED = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GITHUB_CALLBACK_URL',
    'FRONTEND_URL',
    'CONTENT_PATH',
    'PORT',
  ]

  const originalEnv = process.env
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit called')
  })

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    // Set all required vars
    REQUIRED.forEach(v => (process.env[v] = 'test_value'))
  })

  afterEach(() => {
    process.env = originalEnv
    mockExit.mockClear()
  })

  it('passes when all required vars are set', async () => {
    const { validateEnv } = await import('../lib/env')
    expect(() => validateEnv()).not.toThrow()
  })

  it.each(REQUIRED)('exits when %s is missing', async varName => {
    delete process.env[varName]
    const { validateEnv } = await import('../lib/env')
    expect(() => validateEnv()).toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
