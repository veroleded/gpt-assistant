import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { BalanceService } from 'src/libs/balance/balance.service';
import { SessionService } from 'src/modules/session/session.service';

import { Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { helpText, startText } from './texts';
import { UserService } from '../user/user.service';

interface Context extends SceneContext {}
@Injectable()
@Update()
export class TelegramService extends Telegraf<Context> {
    constructor(
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
        private readonly balanceService: BalanceService,
        private readonly userService: UserService,
    ) {
        super(configService.get('TELEGRAM_BOT_TOKEN'));
    }

    @Start()
    async onStart(@Ctx() ctx: Context) {
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
        await this.sessionService.create(id.toString());
        await ctx.replyWithHTML(startText);
    }

    @Command('account')
    async onBalance(@Ctx() ctx: Context) {
        const balance = await this.balanceService.getBalance();
        await ctx.reply(balance + ' рублей.');
    }

    @Help()
    async onHelp(@Ctx() ctx: SceneContext) {
        await ctx.replyWithHTML(helpText);
    }

    @Command('deletecontext')
    async onContext(@Ctx() ctx: Context) {
        const { id } = ctx.message.from;
        await this.sessionService.create(id.toString());
        await ctx.reply('Контекст отчищен!');
    }

    @Command('settings')
    async onSettings(@Ctx() ctx: Context) {
        await ctx.scene.enter('settings');
    }

    @On('text')
    async onText(@Ctx() ctx: Context) {
        await ctx.scene.enter('gpt_scene');
    }

    @On('voice')
    async onVoice(@Ctx() ctx: Context) {
        await ctx.scene.enter('gpt_scene');
    }
}
