import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaModule } from 'src/libs/primsa/prisma.module';
import { MessageModule } from '../message/message.module';

@Module({
    providers: [SessionService],
    imports: [PrismaModule, MessageModule],
    exports: [SessionService],
})
export class SessionModule {}
