import { Command, Ctx, Help, Message, On, Scene, SceneEnter, Start } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/modules/session/session.service';
import { FilesService } from 'src/libs/files/files.service';
import { ChatgptService } from 'src/modules/chatgpt/chatgpt.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { helpText, startText } from '../texts';
import { BalanceService } from 'src/libs/balance/balance.service';

type ImageSize = '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';

@Scene('image')
export class ImageScene {
    private readonly logger = new Logger(ImageScene.name);
    constructor(
        private readonly sessionService: SessionService,
        private readonly balanceService: BalanceService,
        private readonly filesService: FilesService,
        private readonly chatgptService: ChatgptService,
        private readonly configService: ConfigService,
    ) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        ctx.reply(
            'Опишите изображение текстом или голосовым сообщением. Пример описания:\n' +
                'Медведь как космический командир.',
        );
    }

    @Start()
    async onStart(@Ctx() ctx: SceneContext) {
        await ctx.replyWithHTML(startText);
    }

    @Help()
    async onHelp(@Ctx() ctx: SceneContext) {
        await ctx.replyWithHTML(helpText);
    }

    @Command('settings')
    async onSettings(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('settings');
    }

    @Command('deletecontext')
    async onContext(@Ctx() ctx: SceneContext) {
        try {
            const { id } = ctx.message.from;
            const session = await this.sessionService.findCurrentUserSession(id.toString());
            await this.sessionService.removeContext(session.id);
            await ctx.reply('Контекст отчищен!');
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
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
                await ctx.reply('Что-то пошло нет так');
            }
        }
    }

    @On('text')
    async onText(@Ctx() ctx: SceneContext, @Message('text') text: string) {
        try {
            const infoMessage = await ctx.replyWithHTML('<code>Генерирую...</code>');
            const { id } = ctx.message.from;
            const session = await this.sessionService.findCurrentUserSession(id.toString());
            const image = await this.chatgptService.generateImage(
                text,
                session.imageSize as ImageSize,
                session.imageStyle as 'vivid' | 'natural',
            );

            await ctx.deleteMessage(infoMessage.message_id);
            await ctx.replyWithPhoto(image);
            await ctx.scene.leave();
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
    }

    @On('voice')
    async onVoice(@Ctx() ctx: SceneContext, @Message('voice') voice: any) {
        try {
            const infoMessage = await ctx.replyWithHTML('<code>Генерирую...</code>');
            const { id } = ctx.message.from;
            const fileLink = await ctx.telegram.getFileLink(voice.file_id);
            const filepath = await this.filesService.downloadFile(fileLink.href, id.toString(), 'ogg');
            const transcription = await this.chatgptService.transcription(filepath);
            const session = await this.sessionService.findCurrentUserSession(id.toString());
            const image = await this.chatgptService.generateImage(
                transcription,
                session.imageSize as ImageSize,
                session.imageStyle as 'vivid' | 'natural',
            );

            await ctx.deleteMessage(infoMessage.message_id);
            await ctx.replyWithPhoto(image);
            await ctx.scene.leave();
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
    }
}
