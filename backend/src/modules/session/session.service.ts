import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PrismaService } from 'src/libs/primsa/prisma.service';
import { MessageService } from '../message/message.service';

@Injectable()
export class SessionService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly messageService: MessageService,
    ) {}

    async create(userId: string, createSessionDto?: CreateSessionDto) {
        const session = await this.prismaService.session.create({
            data: {
                ...createSessionDto,
                userId,
            },
        });

        return await this.updateCurrentSession(session.id);
    }

    async findCurrentUserSession(userId: string) {
        const session = await this.prismaService.session.findFirst({
            where: {
                current: true,
                userId,
            },
        });

        return session;
    }

    async findAllUserSessions(userId: string, options?: { skip?: number; take?: number }) {
        const sessions = await this.prismaService.session.findMany({
            where: {
                userId,
                current: false,
            },
            orderBy: {
                createAt: 'desc',
            },
            ...(options && options),
        });

        return sessions;
    }

    async remove(id: string) {
        await this.prismaService.session.delete({
            where: { id },
        });
    }

    async removeContext(sessionId: string) {
        const session = await this.findOne(sessionId, true);

        const ids = session.messages.map((message) => message.id);

        await this.messageService.removeMany(ids);
    }

    async findOne(id: string, needMessage: boolean = false) {
        return await this.prismaService.session.findUnique({
            where: { id },
            ...(needMessage && { include: { messages: true } }),
        });
    }

    async update(id: string, updateSessionDto: UpdateSessionDto) {
        return await this.prismaService.session.update({
            where: { id },
            data: updateSessionDto,
        });
    }

    async updateCurrentSession(id: string) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, session] = await this.prismaService.$transaction([
            this.prismaService.session.updateMany({
                data: {
                    current: false,
                },
            }),
            this.prismaService.session.update({
                where: {
                    id,
                },
                data: {
                    current: true,
                },
            }),
        ]);

        return session;
    }
}
