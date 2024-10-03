import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { Command, Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { ChatgptService } from 'src/chatgpt/chatgpt.service';
import { FilesService } from 'src/files/files.service';
import { MessageService } from 'src/message/message.service';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';

import { Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';

interface Context extends SceneContext { }
@Update()
export class TelegramService extends Telegraf<Context> {
    constructor(
        private readonly configService: ConfigService,
        private readonly chatgptService: ChatgptService,
        private readonly filesService: FilesService,
        private readonly userService: UserService,
        private readonly sessionService: SessionService,
        private readonly messageService: MessageService,
    ) {
        super(configService.get('TELEGRAM_BOT_TOKEN'));
    }

    @Start()
    async onStart(@Ctx() ctx: Context) {
        const { id, first_name, last_name, language_code, username } = ctx.message.from;
        const user = await this.userService.create({
            id: id,
            firstName: first_name,
            lastName: last_name,
            languageCode: language_code,
            username
        });

        const session = await this.sessionService.create(user.id);
        await ctx.reply(`Приветствую, ${user.firstName}!`);
    }

    @Command('new')
    async onContext(@Ctx() ctx: Context) {
        const { id } = ctx.message.from;
        const session = await this.sessionService.create(id);
        await ctx.reply('История очищена!');
    }

    @On('text')
    async onMessage(@Ctx() ctx: Context, @Message('text') text: string) {
        try {
            const userId = ctx.message.from.id;

            const session = await this.sessionService.findCurrentUserSession(userId);
            const messages = await this.messageService.findAllSessionMessages(session.id);

            if (messages.length >= 20) {
                return ctx.reply('Сообщения в этом чате закончились, используйте команду /new что бы начать новый');

            }

            const newMessage = { role: Role.user, content: text };
            messages.push(newMessage);

            const response = await this.chatgptService.generateTextResponse(messages);
            const gptMessage = { role: Role.assistant, content: response.content };

            messages.push(gptMessage);

            await this.messageService.createMany(messages.map((message) => ({ ...message, sessionId: session.id })));

            await ctx.reply(response.content);

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
            const userId = ctx.message.from.id;
            const session = await this.sessionService.findCurrentUserSession(userId);
            const messages = await this.messageService.findAllSessionMessages(session.id);
            if (messages.length >= 20) {
                return ctx.reply('Сообщения в этом чате закончились, используйте команду /new что бы начать новый');

            }

            const fileLink = await ctx.telegram.getFileLink(voice.file_id);
            const filepath = await this.filesService.downloadFile(fileLink.href, userId.toString(), 'ogg');
            const transcription = await this.chatgptService.transcription(filepath);

            const newMessage = { role: Role.user, content: transcription };
            messages.push(newMessage);

            const response = await this.chatgptService.generateTextResponse(messages);
            const gptMessage = { role: Role.assistant, content: response.content };

            messages.push(gptMessage);

            await this.messageService.createMany(messages.map((message) => ({ ...message, sessionId: session.id })));

            await ctx.reply(response.content);

            // const audioFilepath = await this.chatgptService.generateVoiceResponse(response.content, userId.toString());
            // await ctx.replyWithAudio({ source: audioFilepath });
            // await this.filesService.removeFile(audioFilepath);
        } catch (error) {
            console.log(error);
            await ctx.reply('Error');
        }
    }
}
