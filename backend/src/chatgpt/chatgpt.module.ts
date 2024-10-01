import { Module } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { HttpModule } from '@nestjs/axios';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { FsModule } from 'src/files/files.module';

@Module({
    imports: [HttpModule, FsModule],
    providers: [
        ChatgptService,
        {
            provide: OpenAI,
            useFactory: (configService: ConfigService) => {
                const apiKey = configService.get('OPENAI_API_KEY');
                const proxy = configService.get('PROXY_OPENAi_URL');
                return new OpenAI({ apiKey, baseURL: proxy });
            },
            inject: [ConfigService],
        },
    ],
    exports: [ChatgptService],
})
export class ChatgptModule {}
