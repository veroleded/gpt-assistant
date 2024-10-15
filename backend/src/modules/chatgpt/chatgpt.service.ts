import { Injectable, Logger } from '@nestjs/common';
import { VoiceName } from '@prisma/client';
import { createReadStream } from 'fs';
import OpenAI from 'openai';
import { FilesService } from 'src/libs/files/files.service';

@Injectable()
export class ChatgptService {
    private readonly logger = new Logger(ChatgptService.name);
    constructor(
        private readonly openai: OpenAI,
        private readonly filesService: FilesService,
    ) {}

    async generateTextResponse(
        messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        model: string = 'gpt-3.5-turbo',
    ): Promise<OpenAI.Chat.Completions.ChatCompletionMessage> {
        const chatCompletion = await this.openai.chat.completions.create({
            model,
            messages,
        });

        return chatCompletion.choices[0].message;
    }

    async generateImage(prompt: string, model: 'dall-e-2' | 'dall-e-3') {
        const image = await this.openai.images.generate({
            prompt,
            model,
        });

        return image.data[0].url;
    }

    async generateVoiceResponse(input: string, voice: VoiceName, filename: string) {
        const mp3 = await this.openai.audio.speech.create({
            model: 'tts-1',
            voice,
            input,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        return await this.filesService.writeFile(filename, buffer, 'mp3');
    }

    async transcription(filepath: string): Promise<string> {
        try {
            const response = await this.openai.audio.transcriptions.create({
                file: createReadStream(filepath),
                model: 'whisper-1',
            });
            this.filesService.removeFile(filepath);
            return response.text;
        } catch (error) {
            this.logger.error(error);
            throw new Error(error);
        }
    }
}
