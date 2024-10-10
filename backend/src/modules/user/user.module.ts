import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/libs/primsa/prisma.module';

@Module({
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
    imports: [PrismaModule],
})
export class UserModule {}
