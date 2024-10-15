import { Command, Ctx, Help, Message, On, Scene, SceneEnter, Start } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/modules/session/session.service';
import { UserService } from 'src/modules/user/user.service';
import { FilesService } from 'src/libs/files/files.service';
import { ChatgptService } from 'src/modules/chatgpt/chatgpt.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { helpText, startText } from '../texts';
import { BalanceService } from 'src/libs/balance/balance.service';

@Scene('set_role')
export class SetRoleScene {
    private readonly logger = new Logger(SetRoleScene.name);
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
            'Опишите текстом или голосовым сообщением как должен вести себя бот. Пример описания:\n' +
                'Отвечай как будто ты великий математик.',
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
            await this.sessionService.create(id.toString());
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
            const { id } = ctx.message.from;
            const session = await this.sessionService.findCurrentUserSession(id.toString());
            await this.sessionService.update(session.id, { context: text });

            await ctx.reply('Сохранено!');
            await ctx.scene.enter('settings');
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
            const { id } = ctx.message.from;
            const fileLink = await ctx.telegram.getFileLink(voice.file_id);
            const filepath = await this.filesService.downloadFile(fileLink.href, id.toString(), 'ogg');
            const transcription = await this.chatgptService.transcription(filepath);
            const session = await this.sessionService.findCurrentUserSession(id.toString());
            await this.sessionService.update(session.id, { context: transcription });

            await ctx.reply('Сохранено!');
            await ctx.scene.enter('setttings');
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
