import { Action, Command, Ctx, Message, On, Scene, SceneEnter, Start } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { Markup } from 'telegraf';
import { Role } from '@prisma/client';
import { SessionService } from 'src/modules/session/session.service';
import { MessageService } from 'src/modules/message/message.service';
import { ChatgptService } from 'src/modules/chatgpt/chatgpt.service';
import { escapeSymbols } from 'src/utils/escapeSymbols';
import { FilesService } from 'src/libs/files/files.service';
import { helpText, startText } from '../texts';
import { BalanceService } from 'src/libs/balance/balance.service';

@Scene('gpt_scene')
export class GptScene {
    constructor(
        private readonly sessionService: SessionService,
        private readonly messageService: MessageService,
        private readonly chatgptService: ChatgptService,
        private readonly filesService: FilesService,
        private readonly balanceService: BalanceService,
    ) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        if (!ctx.message) {
            await ctx.reply('Задайте свой вопрос');
        } else {
            if ('text' in ctx.message) {
                await this.onTextMessage(ctx, ctx.message.text);
            }

            if ('voice' in ctx.message) {
                await this.onVoice(ctx, ctx.message.voice);
            }
        }
    }

    @Command('deletecontext')
    async onContext(@Ctx() ctx: SceneContext) {
        const { id } = ctx.message.from;
        await this.sessionService.create(id.toString());
        await ctx.reply('Контекст отчищен!');
    }

    @Command('account')
    async onBalance(@Ctx() ctx: SceneContext) {
        const balance = await this.balanceService.getBalance();
        await ctx.reply(balance + ' рублей.');
    }

    @Command('settings')
    async onMenu(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('settings');
    }

    @Start()
    async onStart(@Ctx() ctx: SceneContext) {
        await ctx.replyWithHTML(startText);
    }

    @Command('help')
    async onHelp(@Ctx() ctx: SceneContext) {
        await ctx.replyWithHTML(helpText);
    }

    @Action('text')
    async getTextTranscription(@Ctx() ctx: SceneContext) {
        const callbackQuery = ctx.callbackQuery;

        if ('data' in callbackQuery) {
            const userId = callbackQuery.from.id.toString();
            const session = await this.sessionService.findCurrentUserSession(userId);
            const messages = await this.messageService.findAllSessionMessages(session.id);

            await ctx.replyWithMarkdownV2(escapeSymbols(messages[messages.length - 1].content));
        }
    }

    @On('text')
    async onTextMessage(@Ctx() ctx: SceneContext, @Message('text') text: string) {
        try {
            const infoMessage = await ctx.replyWithHTML('<code>Подождите, идет генерация ответа...</code>');
            const userId = ctx.message.from.id.toString();

            const session = await this.sessionService.findCurrentUserSession(userId);

            const symstemMessage = session.context ? { role: Role.system, content: session.context } : undefined;
            const messages = await this.messageService.findAllSessionMessages(session.id);

            if (messages.length >= 40) {
                return ctx.reply('Сообщения в этом чате закончились, используйте команду /new что бы начать новый');
            }

            if (symstemMessage) {
                messages.unshift(symstemMessage);
            }

            const newMessage = { role: Role.user, content: text };

            messages.push(newMessage);

            const response = await this.chatgptService.generateTextResponse(messages);
            const gptMessage = { role: Role.assistant, content: response.content };

            await this.messageService.create({ ...newMessage, sessionId: session.id });
            await this.messageService.create({ ...gptMessage, sessionId: session.id });

            if (!session.voice) {
                await ctx.deleteMessage(infoMessage.message_id);
                await ctx.replyWithMarkdownV2(escapeSymbols(response.content));
            } else {
                const audioFilepath = await this.chatgptService.generateVoiceResponse(
                    gptMessage.content,
                    userId.toString(),
                );
                await ctx.deleteMessage(infoMessage.message_id);
                await ctx.replyWithAudio(
                    { source: audioFilepath },
                    Markup.inlineKeyboard([Markup.button.callback('Получить текстовый ответ', 'text')]),
                );
                await this.filesService.removeFile(audioFilepath);
            }
        } catch (error) {
            console.log(error);
            await ctx.reply(error.message);
        }
    }

    @On('voice')
    async onVoice(@Ctx() ctx: SceneContext, @Message('voice') voice: any) {
        try {
            const infoMessage = await ctx.replyWithHTML('<code>Подождите, идет генерация ответа...</code>');
            const userId = ctx.message.from.id.toString();

            const session = await this.sessionService.findCurrentUserSession(userId);

            const symstemMessage = session.context ? { role: Role.system, content: session.context } : undefined;
            const messages = await this.messageService.findAllSessionMessages(session.id);

            if (messages.length >= 20) {
                await ctx.reply('Сообщения в этом чате закончились, используйте команду /new что бы начать новый');
                return;
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

            await this.messageService.create({ ...newMessage, sessionId: session.id });
            await this.messageService.create({ ...gptMessage, sessionId: session.id });

            if (!session.voice) {
                await ctx.deleteMessage(infoMessage.message_id);
                await ctx.replyWithMarkdownV2(escapeSymbols(response.content));
            } else {
                const audioFilepath = await this.chatgptService.generateVoiceResponse(
                    gptMessage.content,
                    userId.toString(),
                );
                await ctx.deleteMessage(infoMessage.message_id);
                await ctx.replyWithAudio(
                    { source: audioFilepath },
                    Markup.inlineKeyboard([Markup.button.callback('Получить текстовый ответ', 'text')]),
                );
                await this.filesService.removeFile(audioFilepath);
            }
        } catch (error) {
            console.log(error);
            await ctx.reply('Error');
        }
    }
}
