import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/libs/primsa/prisma.service';

@Injectable()
export class MessageService {
    constructor(private readonly prismaService: PrismaService) { }

    async create(createMessageDto: CreateMessageDto) {
        const message = await this.prismaService.message.create({
            data: { ...createMessageDto },
        });
        return message;
    }

    async findAllSessionMessages(sessionId: string) {
        return await this.prismaService.session
            .findUnique({
                where: { id: sessionId },
                include: {
                    messages: {
                        select: {
                            role: true,
                            content: true,
                        },

                        orderBy: {
                            createAt: 'asc',
                        },
                    },
                },
            })
            .then((session) => session.messages);
    }

    async createMany(createMessageDtos: CreateMessageDto[]) {
        const message = await this.prismaService.message.createMany({
            data: createMessageDtos,
        });
        return message;
    }


    async remove(id: string) {
        await this.prismaService.message.delete({
            where: { id }
        });
    }

    async removeMany(ids: string[]) {
        await this.prismaService.message.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    }
}
