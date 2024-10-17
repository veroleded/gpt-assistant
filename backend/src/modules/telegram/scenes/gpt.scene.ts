import { Action, Command, Ctx, Message, On, Scene, SceneEnter, Start } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { Markup } from 'telegraf';
import { Role } from '@prisma/client';
import { SessionService } from 'src/modules/session/session.service';
import { MessageService } from 'src/modules/message/message.service';
import { ChatgptService } from 'src/modules/chatgpt/chatgpt.service';
import { escapeSymbols } from 'src/utils/escapeSymbols';
import { FilesService } from 'src/libs/files/files.service';
import { answerGenerationText, errorText, helpText, newText, startText } from '../texts';
import { BalanceService } from 'src/libs/balance/balance.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Scene('gpt_scene')
export class GptScene {
    private readonly logger = new Logger(GptScene.name);
    constructor(
        private readonly sessionService: SessionService,
        private readonly messageService: MessageService,
        private readonly chatgptService: ChatgptService,
        private readonly filesService: FilesService,
        private readonly balanceService: BalanceService,
        private readonly configService: ConfigService,
    ) { }

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        try {
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
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
    }

    @Command('deletecontext')
    async onContext(@Ctx() ctx: SceneContext) {
        try {
            const { id } = ctx.message.from;
            await this.sessionService.create(id.toString());
            await ctx.reply('Контекст отчищен!');
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
    }

    @Command('image')
    async onImage(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('image');
    }

    @Command('new')
    async onNew(@Ctx() ctx: SceneContext) {
        const userId = ctx.message.from.id

        await this.sessionService.create(userId.toString());

        await ctx.reply(newText)

    }

    @Command('account')
    async onBalance(@Ctx() ctx: SceneContext) {
        try {
            const balance = await this.balanceService.getBalance();
            await ctx.reply(balance + ' рублей.');
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
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
        try {
            const callbackQuery = ctx.callbackQuery;

            if ('data' in callbackQuery) {
                const userId = callbackQuery.from.id.toString();
                const session = await this.sessionService.findCurrentUserSession(userId);
                const messages = await this.messageService.findAllSessionMessages(session.id);

                await ctx.replyWithMarkdownV2(escapeSymbols(messages[messages.length - 1].content));
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
    }

    @On('text')
    async onTextMessage(@Ctx() ctx: SceneContext, @Message('text') text: string) {
        try {
            const infoMessage = await ctx.replyWithHTML(answerGenerationText);
            const userId = ctx.message.from.id.toString();

            const session = await this.sessionService.findCurrentUserSession(userId);
            const messages = await this.messageService.findAllSessionMessages(session.id);

            if (messages.length === 0) {
                const name = text.split(/[.?!]/)[0];

                await this.sessionService.update(session.id, { name });
            }

            const symstemMessage = session.assistantRole ? { role: Role.system, content: session.assistantRole } : undefined;

            if (symstemMessage) {
                messages.unshift(symstemMessage);
            }

            const newMessage = { role: Role.user, content: text };

            messages.push(newMessage);

            const response = await this.chatgptService.generateTextResponse(messages);
            const gptMessage = { role: Role.assistant, content: response.content };

            if (session.onContext) {
                await this.messageService.create({ ...newMessage, sessionId: session.id });
                await this.messageService.create({ ...gptMessage, sessionId: session.id });
            }

            if (!session.voice) {
                await ctx.deleteMessage(infoMessage.message_id);
                await ctx.replyWithMarkdownV2(escapeSymbols(response.content));
            } else {
                const audioFilepath = await this.chatgptService.generateVoiceResponse(
                    gptMessage.content,
                    session.voiceName,
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
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
    }

    @On('voice')
    async onVoice(@Ctx() ctx: SceneContext, @Message('voice') voice: any) {
        try {
            const infoMessage = await ctx.replyWithHTML(answerGenerationText);
            const userId = ctx.message.from.id.toString();

            const session = await this.sessionService.findCurrentUserSession(userId);
            const messages = await this.messageService.findAllSessionMessages(session.id);

            const fileLink = await ctx.telegram.getFileLink(voice.file_id);
            const filepath = await this.filesService.downloadFile(fileLink.href, userId.toString(), 'ogg');
            const transcription = await this.chatgptService.transcription(filepath);

            if (messages.length === 0) {
                const name = transcription.split(/[.?!]/)[0];

                await this.sessionService.update(session.id, { name });
            }

            const symstemMessage = session.assistantRole ? { role: Role.system, content: session.assistantRole } : undefined;

            if (symstemMessage) {
                messages.unshift(symstemMessage);
            }


            const newMessage = { role: Role.user, content: transcription };
            messages.push(newMessage);

            const response = await this.chatgptService.generateTextResponse(messages);
            const gptMessage = { role: Role.assistant, content: response.content };

            if (session.onContext) {
                await this.messageService.create({ ...newMessage, sessionId: session.id });
                await this.messageService.create({ ...gptMessage, sessionId: session.id });
            }

            if (!session.voice) {
                await ctx.deleteMessage(infoMessage.message_id);
                await ctx.replyWithMarkdownV2(escapeSymbols(response.content));
            } else {
                const audioFilepath = await this.chatgptService.generateVoiceResponse(
                    gptMessage.content,
                    session.voiceName,
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
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
    }
}
