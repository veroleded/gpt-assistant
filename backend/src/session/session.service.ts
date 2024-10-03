import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PrismaService } from 'src/primsa/prisma.service';

@Injectable()
export class SessionService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: number, createSessionDto?: CreateSessionDto) {
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

    async findCurrentUserSession(userId: number) {
        return await this.prismaService.user
            .findUnique({
                where: {
                    id: userId,
                },
                include: {
                    session: {
                        orderBy: { updatedAt: 'desc' },
                        take: 1,
                    },
                },
            })
            .then((user) => user.session[0]);
    }

    findAll() {
        return `This action returns all session`;
    }

    findOne(id: number) {
        return `This action returns a #${id} session`;
    }

    update(id: number, updateSessionDto: UpdateSessionDto) {
        return `This action updates a #${id} session`;
    }

    remove(id: number) {
        return `This action removes a #${id} session`;
    }
}
