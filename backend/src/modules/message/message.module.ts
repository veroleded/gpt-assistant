import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { PrismaModule } from 'src/libs/primsa/prisma.module';

@Module({
    providers: [MessageService],
    imports: [PrismaModule],
    exports: [MessageService],
})
export class MessageModule {}
