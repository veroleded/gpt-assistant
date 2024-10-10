import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { BalanceService } from 'src/libs/balance/balance.service';
import { SessionService } from 'src/modules/session/session.service';

import { Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';

interface Context extends SceneContext {}
@Injectable()
@Update()
export class TelegramService extends Telegraf<Context> {
    constructor(
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
        private readonly balanceService: BalanceService,
    ) {
        super(configService.get('TELEGRAM_BOT_TOKEN'));
    }

    @Start()
    async onStart(@Ctx() ctx: Context) {
        const { id } = ctx.message.from;
        const prevSession = await this.sessionService.findCurrentUserSession(id.toString());

        if (!prevSession) {
            return await ctx.scene.enter('start');
        }

        return await ctx.scene.enter('menu');
    }

    @Command('balance')
    async onBalance(@Ctx() ctx: Context) {
        const balance = await this.balanceService.getBalance();
        await ctx.reply(balance + ' рублей.');
    }

    @Command('new')
    async onContext(@Ctx() ctx: Context) {
        const { id } = ctx.message.from;
        await this.sessionService.create(id.toString());
        await ctx.reply('История очищена!');
        await ctx.scene.enter('menu');
    }

    @Command('menu')
    async onMenu(@Ctx() ctx: Context) {
        await ctx.scene.enter('menu');
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
