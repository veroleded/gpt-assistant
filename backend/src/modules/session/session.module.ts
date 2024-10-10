import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { PrismaModule } from 'src/libs/primsa/prisma.module';

@Module({
    controllers: [SessionController],
    providers: [SessionService],
    imports: [PrismaModule],
    exports: [SessionService],
})
export class SessionModule {}
