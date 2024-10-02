import { ConfigService } from '@nestjs/config';
import { Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { ChatCompletionUserMessageParam } from 'openai/resources';
import { ChatgptService } from 'src/chatgpt/chatgpt.service';
import { FilesService } from 'src/files/files.service';
import { UserService } from 'src/user/user.service';
import { interTagCode } from 'src/utils/interTagCode';

import { Telegraf } from 'telegraf';
import { code } from 'telegraf/format';
import { SceneContext } from 'telegraf/typings/scenes';

interface Context extends SceneContext {}
@Update()
export class TelegramService extends Telegraf<Context> {
    constructor(
        private readonly configService: ConfigService,
        private readonly chatgptService: ChatgptService,
        private readonly filesService: FilesService,
        private readonly userService: UserService,
    ) {
        super(configService.get('TELEGRAM_BOT_TOKEN'));
    }

    @Start()
    async onStart(@Ctx() ctx: Context) {
        const {id, first_name, last_name, language_code, username} = ctx.message.from;
        const user = await this.userService.create({
            id: id,
            firstName: first_name,
            lastName: last_name,
            languageCode: language_code,
            username
        })
        await ctx.reply(`Приветствую, ${user.firstName}!`);
    }

    @On('text')
    async onMessage(@Ctx() ctx: Context, @Message('text') text: string) {
        try {
            await ctx.reply(code('Жду ответ от сервера...'));
            const messages = [{ role: 'user', content: text } as ChatCompletionUserMessageParam];
            const userId = ctx.message.from.id
            const response = await this.chatgptService.generateTextResponse(messages);
            await ctx.replyWithHTML(interTagCode(response.content));

            // const audioFilepath = await this.chatgptService.generateVoiceResponse(response.content, userId.toString());
            // await ctx.replyWithAudio({source: audioFilepath});
            // await this.filesService.removeFile(audioFilepath);
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
            const filepath = await this.filesService.downloadFile(fileLink.href, userId.toString(), 'ogg');
            const transcription = await this.chatgptService.transcription(filepath);
            const messages = [{ role: 'user', content: transcription } as ChatCompletionUserMessageParam];
            const response = await this.chatgptService.generateTextResponse(messages);
            await ctx.replyWithHTML(interTagCode(response.content));

            const audioFilepath = await this.chatgptService.generateVoiceResponse(response.content, userId.toString());
            await ctx.replyWithAudio({source: audioFilepath});
            await this.filesService.removeFile(audioFilepath);
        } catch (error) {
            console.log(error);
            await ctx.reply('Error');
        }
    }
}
