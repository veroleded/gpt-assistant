import { Command, Ctx, Help, Message, On, Scene, SceneEnter, Start } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/modules/session/session.service';
import { FilesService } from 'src/libs/files/files.service';
import { ChatgptService } from 'src/modules/chatgpt/chatgpt.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { helpText, newText, startText } from '../texts';
import { BalanceService } from 'src/libs/balance/balance.service';

@Scene('selectChat')
export class SelectChatScene {
    private readonly logger = new Logger(SelectChatScene.name);
    constructor(
        private readonly sessionService: SessionService,
        private readonly balanceService: BalanceService,
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

    @Command('new')
    async onNew(@Ctx() ctx: SceneContext) {
        const userId = ctx.message.from.id

        await this.sessionService.create(userId.toString());

        await ctx.reply(newText)

    }

    @On('text')
    async onText(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('gpt_scene');
    }

    @On('voice')
    async onVoice(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('gpt_scene');
    }
}
