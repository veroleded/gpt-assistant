import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/primsa/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(createMessageDto: CreateMessageDto) {
    const message = await this.prismaService.message.create({
      data: { ...createMessageDto }
    });
    return message;
  }

  async findAllSessionMessages(sessionId: string) {
    return await this.prismaService.session.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          select: {
            role: true,
            content: true
          },

          orderBy: {
            createAt: 'asc'
          },
        }
      }
    }).then((session) => session.messages);
  }

  async createMany(createMessageDtos: CreateMessageDto[]) {
    const message = await this.prismaService.message.createMany({
      data: createMessageDtos
    });
    return message;
  }

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
