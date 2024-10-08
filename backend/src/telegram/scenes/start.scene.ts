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
        const { id, first_name, last_name, language_code, username } = ctx.message.from;
        await this.userService.create({
            id: id,
            firstName: first_name,
            lastName: last_name,
            languageCode: language_code,
            username,
        });
        await this.sessionService.create(id);
        await ctx.reply(
            'Привет!',
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
