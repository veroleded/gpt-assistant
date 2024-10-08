import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { SessionService } from 'src/session/session.service';

import { Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';

interface Context extends SceneContext {}
@Injectable()
@Update()
export class TelegramService extends Telegraf<Context> {
    constructor(
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
    ) {
        super(configService.get('TELEGRAM_BOT_TOKEN'));
    }

    @Start()
    async onStart(@Ctx() ctx: Context) {
        const { id } = ctx.message.from;
        const prevSession = await this.sessionService.findCurrentUserSession(id);

        if (prevSession) {
            return await ctx.scene.enter('start');
        }

        return await ctx.scene.enter('main');
    }

    @Command('new')
    async onContext(@Ctx() ctx: Context) {
        const { id } = ctx.message.from;
        await this.sessionService.create(id);
        await ctx.reply('История очищена!');
        await ctx.scene.enter('menu');
    }

    @Command('menu')
    async onMenu(@Ctx() ctx: Context) {
        await ctx.scene.enter('menu');
    }
}
