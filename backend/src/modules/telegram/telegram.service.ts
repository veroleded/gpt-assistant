import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { BalanceService } from 'src/libs/balance/balance.service';
import { SessionService } from 'src/modules/session/session.service';

import { Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { errorText, helpText, newText, startText } from './texts';
import { UserService } from '../user/user.service';

@Injectable()
@Update()
export class TelegramService extends Telegraf<SceneContext> {
    private readonly logger = new Logger(TelegramService.name);
    constructor(
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
        private readonly balanceService: BalanceService,
        private readonly userService: UserService,
    ) {
        super(configService.get('TELEGRAM_BOT_TOKEN'));
    }

    @Start()
    async onStart(@Ctx() ctx: SceneContext) {
        try {
            const { id, first_name, last_name, language_code, username } = ctx.message.from;
            await this.userService.create({
                id: id.toString(),
                firstName: first_name,
                lastName: last_name,
                languageCode: language_code,
                username,
            });
            const oldSession = await this.sessionService.findCurrentUserSession(id.toString());
            if (!oldSession) {
                await this.sessionService.create(id.toString());
            }

            await ctx.replyWithHTML(startText);
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

    @Help()
    async onHelp(@Ctx() ctx: SceneContext) {
        await ctx.replyWithHTML(helpText);
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
                await ctx.reply(errorText);
            }
        }
    }

    @Command('image')
    async onImage(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('image');
    }

    @Command('settings')
    async onSettings(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('settings');
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
