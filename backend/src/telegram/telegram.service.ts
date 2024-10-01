import { ConfigService } from '@nestjs/config';
import { Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { ChatCompletionUserMessageParam } from 'openai/resources';
import { ChatgptService } from 'src/chatgpt/chatgpt.service';
import { FsService } from 'src/files/files.service';
import { Telegraf } from 'telegraf';
import { code } from 'telegraf/format';
import { SceneContext } from 'telegraf/typings/scenes';

interface Context extends SceneContext {}
@Update()
export class TelegramService extends Telegraf<Context> {
    constructor(
        private readonly configService: ConfigService,
        private readonly chatgptService: ChatgptService,
        private readonly fsService: FsService,
    ) {
        super(configService.get('TELEGRAM_BOT_TOKEN'));
    }

    @Start()
    async onStart(@Ctx() ctx: Context) {
        await ctx.reply('Start');
    }

    @On('text')
    async onMessage(@Ctx() ctx: Context, @Message('text') text: string) {
        try {
            await ctx.reply(code('Жду ответ от сервера...'));
            const messages = [{ role: 'user', content: text } as ChatCompletionUserMessageParam];
            const response = await this.chatgptService.generateTextResponse(messages);
            await ctx.reply(response.content);
        } catch (error) {
            console.log(error);
            await ctx.reply('Error');
        }
    }

    @On('voice')
    async onVoice(@Ctx() ctx: Context, @Message('voice') voice: any) {
        try {
            await ctx.reply(code('Жду ответ от сервера...'));
            const fileLink = await ctx.telegram.getFileLink(voice.file_id);
            const userId = ctx.message.from.id;
            const filepath = await this.fsService.downloadFile(fileLink.href, userId.toString(), 'ogg');
            console.log(filepath);
            const transcription = await this.chatgptService.transcription(filepath);
            const messages = [{ role: 'user', content: transcription } as ChatCompletionUserMessageParam];
            const response = await this.chatgptService.generateTextResponse(messages);
            ctx.reply(response.content);
        } catch (error) {
            console.log(error);
            await ctx.reply('Error');
        }
    }
}
