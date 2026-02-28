import fs from 'node:fs'
import path from 'node:path'

jest.mock('node:fs')
jest.mock('../lib/logger', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), fatal: jest.fn() },
}))

// Hoist process.exit spy at module level so no test can accidentally call it for real
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called')
})

import { contentService } from '../services/content.service'
import { NotFoundError } from '../lib/errors'

const mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>
const mockReaddirSync = fs.readdirSync as jest.MockedFunction<typeof fs.readdirSync>
const mockReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>

const CONTENT_PATH = '/data/devops-challenges'

function makeDirent(name: string, isDir: boolean): fs.Dirent {
  return { name, isDirectory: () => isDir } as unknown as fs.Dirent
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env.CONTENT_PATH = CONTENT_PATH
  // Safe default: CONTENT_PATH exists
  mockExistsSync.mockReturnValue(true)
  contentService.__resetForTesting()
})

afterAll(() => {
  mockExit.mockRestore()
})

describe('contentService.initialize', () => {
  it('builds ContentIndex from directory structure', () => {
    mockReaddirSync
      .mockReturnValueOnce([makeDirent('docker', true), makeDirent('kubernetes', true)] as any)
      .mockReturnValueOnce([makeDirent('01-intro', true), makeDirent('02-basics', true)] as any)
      .mockReturnValueOnce([makeDirent('01-pods', true)] as any)

    contentService.initialize()

    const index = contentService.getUnitsIndex()
    expect(index).toEqual([
      { unit: 'docker', exercises: ['01-intro', '02-basics'] },
      { unit: 'kubernetes', exercises: ['01-pods'] },
    ])
  })

  it('calls process.exit(1) when CONTENT_PATH does not exist', () => {
    mockExistsSync.mockReturnValue(false)
    expect(() => contentService.initialize()).toThrow('process.exit called')
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})

describe('contentService.getFileContent', () => {
  function setup() {
    mockReaddirSync
      .mockReturnValueOnce([makeDirent('docker', true)] as any)
      .mockReturnValueOnce([makeDirent('01-intro', true)] as any)
    contentService.initialize()
    return contentService
  }

  it('throws NotFoundError for unknown unit', () => {
    const svc = setup()
    expect(() => svc.getFileContent('unknown', '01-intro', 'README.md')).toThrow(NotFoundError)
  })

  it('throws NotFoundError for unknown exercise', () => {
    const svc = setup()
    expect(() => svc.getFileContent('docker', 'unknown-exercise', 'README.md')).toThrow(NotFoundError)
  })

  it('throws NotFoundError for path traversal attempt in file param', () => {
    const svc = setup()
    expect(() => svc.getFileContent('docker', '01-intro', '../secret')).toThrow(NotFoundError)
  })

  it('reads file from disk on cache miss then serves from cache', () => {
    mockReaddirSync
      .mockReturnValueOnce([makeDirent('docker', true)] as any)
      .mockReturnValueOnce([makeDirent('01-intro', true)] as any)
    mockReadFileSync.mockReturnValue('# Challenge content' as any)

    contentService.initialize()

    const result = contentService.getFileContent('docker', '01-intro', 'challenge.md')
    expect(result).toBe('# Challenge content')
    expect(mockReadFileSync).toHaveBeenCalledWith(
      path.join(CONTENT_PATH, 'docker', '01-intro', 'challenge.md'),
      'utf-8'
    )

    // Second call must hit cache — readFileSync not called again
    mockReadFileSync.mockClear()
    contentService.getFileContent('docker', '01-intro', 'challenge.md')
    expect(mockReadFileSync).not.toHaveBeenCalled()
  })
})
