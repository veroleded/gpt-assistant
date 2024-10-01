import { Injectable, Logger } from '@nestjs/common';
import { createReadStream } from 'fs';
import OpenAI from 'openai';
import { FsService } from 'src/files/files.service';

@Injectable()
export class ChatgptService {
    private readonly logger = new Logger(ChatgptService.name);
    constructor(
        private readonly openai: OpenAI,
        private readonly fsService: FsService,
    ) {}

    async generateTextResponse(
        messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        model: string = 'gpt-3.5-turbo',
    ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
        try {
            const chatCompletion = await this.openai.chat.completions.create({
                model,
                messages,
            });

            return chatCompletion.choices[0].message;
        } catch (error) {
            this.logger.error(error);
            throw new Error(error);
        }
    }

    async transcription(filepath: string): Promise<string> {
        try {
            const response = await this.openai.audio.transcriptions.create({
                file: createReadStream(filepath),
                model: 'whisper-1',
            });
            this.fsService.removeFile(filepath);
            return response.text;
        } catch (error) {
            this.logger.error(error);
            throw new Error(error);
        }
    }
}
