import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PrismaService } from 'src/primsa/prisma.service';

@Injectable()
export class SessionService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: string, createSessionDto?: CreateSessionDto) {
        const session = await this.prismaService.session.create({
            data: {
                ...createSessionDto,
                user: {
                    connect: { id: userId },
                },
            },
        });

        return session;
    }

    async findCurrentUserSession(userId: string) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                session: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1,
                },
            },
        });


        const session = user?.session?.[0];

        return session;
    }

    findAll() {
        return `This action returns all session`;
    }

    findOne(id: number) {
        return `This action returns a #${id} session`;
    }

    async update(id: string, updateSessionDto: UpdateSessionDto) {
        return await this.prismaService.session.update({
            where: { id },
            data: updateSessionDto,
        });
    }

    remove(id: number) {
        return `This action removes a #${id} session`;
    }
}
