import { Ctx, Start, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/typings/scenes';

interface Context extends SceneContext {}
@Update()
export class TelegramService extends Telegraf<Context> {
    @Start()
    async onStart(@Ctx() ctx: Context) {
        await ctx.reply('Start');
    }
}
