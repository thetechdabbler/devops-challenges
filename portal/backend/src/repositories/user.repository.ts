import { User } from '@prisma/client'
import { prisma } from '../lib/prisma'

export const userRepository = {
  async findByGithubId(githubId: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { github_id: githubId } })
  },

  async upsert(data: { githubId: number; username: string; avatarUrl: string }): Promise<User> {
    return prisma.user.upsert({
      where: { github_id: data.githubId },
      create: {
        github_id: data.githubId,
        username: data.username,
        avatar_url: data.avatarUrl,
      },
      update: {
        username: data.username,
        avatar_url: data.avatarUrl,
      },
    })
  },
}
