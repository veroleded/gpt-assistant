import { Module } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    providers: [ChatgptService],
    exports: [ChatgptService],
})
export class ChatgptModule {}
