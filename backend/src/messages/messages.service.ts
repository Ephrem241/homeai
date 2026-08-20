import { Injectable, NotFoundException } from '@nestjs/common';
import type { Message } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

// One thread per pair of users, independent of which property (if any) a
// given message references — a deterministic id so both participants land
// in the same conversation regardless of who sent first.
function buildThreadId(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join('_');
}

function isParticipant(threadId: string, userId: string): boolean {
  return threadId.split('_').includes(userId);
}

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  sendMessage(senderId: string, dto: SendMessageDto) {
    return this.prisma.message.create({
      data: {
        threadId: buildThreadId(senderId, dto.recipientId),
        senderId,
        propertyId: dto.propertyId,
        body: dto.body,
      },
    });
  }

  async findThreads(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ threadId: { startsWith: `${userId}_` } }, { threadId: { endsWith: `_${userId}` } }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true } },
        property: { select: { title: true } },
      },
    });

    const latestByThread = new Map<string, (typeof messages)[number]>();
    for (const message of messages) {
      if (!latestByThread.has(message.threadId)) {
        latestByThread.set(message.threadId, message);
      }
    }

    const threads = [];
    for (const [threadId, lastMessage] of latestByThread) {
      const [idA, idB] = threadId.split('_');
      const otherUserId = idA === userId ? idB : idA;
      const otherUser =
        lastMessage.senderId === otherUserId
          ? lastMessage.sender
          : await this.prisma.user.findUnique({
              where: { id: otherUserId },
              select: { id: true, name: true },
            });

      threads.push({
        threadId,
        otherUser: otherUser ?? { id: otherUserId, name: 'Unknown' },
        lastMessage: {
          body: lastMessage.body,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt,
        },
        propertyTitle: lastMessage.property?.title || null,
      });
    }

    return threads.sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime(),
    );
  }

  findMessages(
    threadId: string,
    userId: string,
  ): Promise<(Message & { property: { id: string; title: string; photos: string[] } | null })[]> {
    if (!isParticipant(threadId, userId)) {
      // 404s rather than 403s so a guessed threadId can't be used to probe
      // for its existence.
      throw new NotFoundException('Thread not found');
    }
    return this.prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      include: { property: { select: { id: true, title: true, photos: true } } },
    });
  }
}
