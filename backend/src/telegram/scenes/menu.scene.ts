import { Action, Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { Markup } from 'telegraf';

@Scene('start')
export class StartScene {
    constructor(
        private readonly sessionService: SessionService,
        private readonly userService: UserService,
    ) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        await ctx.reply(
            'Выберете что вы хотите поменять',
            Markup.inlineKeyboard([
                Markup.button.callback('Задать контекст', 'context'),
                Markup.button.callback('Выбрать модель', 'models'),
            ]),
        );
    }

    @Action('context')
    async SetContext(@Ctx() ctx: SceneContext) {
        console.log('context')
        await ctx.scene.enter('set_context');
    }

    @Action('models')
    async setModel(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('set_models')
    }
}
