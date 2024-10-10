import { Module } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { HttpModule } from '@nestjs/axios';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { FilesModule } from 'src/libs/files/files.module';
;

@Module({
    imports: [HttpModule, FilesModule],
    providers: [
        ChatgptService,
        {
            provide: OpenAI,
            useFactory: (configService: ConfigService) => {
                const apiKey = configService.get('OPENAI_API_KEY');
                const proxy = configService.get('PROXY_OPENAI_URL');
                return new OpenAI({ apiKey, baseURL: proxy });
            },
            inject: [ConfigService],
        },
    ],
    exports: [ChatgptService],
})
export class ChatgptModule {}
