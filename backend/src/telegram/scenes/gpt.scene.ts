import { Command, Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { Markup } from 'telegraf';
import { MessageService } from 'src/message/message.service';
import { Role } from '@prisma/client';
import { ChatgptService } from 'src/chatgpt/chatgpt.service';
import { FilesService } from 'src/files/files.service';

@Scene('gpt_scene')
export class GptScene {
    constructor(
        private readonly sessionService: SessionService,
        private readonly userService: UserService,
        private readonly messageService: MessageService,
        private readonly chatgptService: ChatgptService,
        private readonly filesService: FilesService,

    ) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        await ctx.reply('Чем я могу вам помочь?')
    }

    @Command('new')
    async onContext(@Ctx() ctx: SceneContext) {
        const { id } = ctx.message.from;
        await this.sessionService.create(id);
        await ctx.reply('История очищена!');
        await ctx.scene.enter('menu');
    }

    @Command('menu')
    async onMenu(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('menu');
    }

    @On('text')
    async onMessage(@Ctx() ctx: SceneContext, @Message('text') text: string) {
        try {
            const userId = ctx.message.from.id;

            const session = await this.sessionService.findCurrentUserSession(userId);

            const symstemMessage = session.context ? {role: Role.system, content: session.context} : undefined;
            const messages = await this.messageService.findAllSessionMessages(session.id);


            if (messages.length >= 20) {
                return ctx.reply('Сообщения в этом чате закончились, используйте команду /new что бы начать новый');
            }

            if (symstemMessage) {
              messages.unshift(symstemMessage);
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
    async onVoice(@Ctx() ctx: SceneContext, @Message('voice') voice: any) {
        try {
            const userId = ctx.message.from.id;

            const session = await this.sessionService.findCurrentUserSession(userId);

            const symstemMessage = session.context ? {role: Role.system, content: session.context} : undefined;
            const messages = await this.messageService.findAllSessionMessages(session.id);
            if (messages.length >= 20) {
                return ctx.reply('Сообщения в этом чате закончились, используйте команду /new что бы начать новый');
            }

            if (symstemMessage) {
              messages.unshift(symstemMessage);
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

            const audioFilepath = await this.chatgptService.generateVoiceResponse(response.content, userId.toString());
            await ctx.replyWithAudio({ source: audioFilepath });
            await this.filesService.removeFile(audioFilepath);
        } catch (error) {
            console.log(error);
            await ctx.reply('Error');
        }
    }
}