import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaModule } from 'src/libs/primsa/prisma.module';

@Module({
    controllers: [MessageController],
    providers: [MessageService],
    imports: [PrismaModule],
    exports: [MessageService],
})
export class MessageModule {}
