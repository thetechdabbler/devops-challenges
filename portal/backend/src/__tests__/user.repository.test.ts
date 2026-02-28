jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}))

import { userRepository } from '../repositories/user.repository'
import { prisma } from '../lib/prisma'

const mockFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>
const mockUpsert = prisma.user.upsert as jest.MockedFunction<typeof prisma.user.upsert>

const fakeUser = {
  id: 1,
  github_id: 12345,
  username: 'octocat',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345',
  created_at: new Date(),
}

describe('userRepository.findByGithubId', () => {
  it('returns user when found', async () => {
    mockFindUnique.mockResolvedValueOnce(fakeUser)
    const result = await userRepository.findByGithubId(12345)
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { github_id: 12345 } })
    expect(result).toEqual(fakeUser)
  })

  it('returns null when not found', async () => {
    mockFindUnique.mockResolvedValueOnce(null)
    const result = await userRepository.findByGithubId(99999)
    expect(result).toBeNull()
  })
})

describe('userRepository.upsert', () => {
  it('calls prisma.user.upsert with correct args and returns user', async () => {
    mockUpsert.mockResolvedValueOnce(fakeUser)
    const result = await userRepository.upsert({
      githubId: 12345,
      username: 'octocat',
      avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
    })
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { github_id: 12345 },
      create: { github_id: 12345, username: 'octocat', avatar_url: 'https://avatars.githubusercontent.com/u/12345' },
      update: { username: 'octocat', avatar_url: 'https://avatars.githubusercontent.com/u/12345' },
    })
    expect(result).toEqual(fakeUser)
  })
})
