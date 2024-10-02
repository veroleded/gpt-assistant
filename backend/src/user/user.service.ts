import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/primsa/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) { };
  async create(createUserDto: CreateUserDto) {

    const user = await this.findOne(createUserDto.tgId);
    if (user) {
      return user;
    }
    return await this.prismaService.user.create({
      data: createUserDto
    });
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(tgId: number) {
    return await this.prismaService.user.findFirst({
      where: {
        tgId
      }
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
