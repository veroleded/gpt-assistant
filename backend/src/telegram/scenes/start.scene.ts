import { Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';

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
        return await ctx.reply('asd', {
            reply_markup: { keyboard: [[{ text: 'Кнопка А' }, { text: 'Кнопка Б' }]], resize_keyboard: true },
        });
    }
}
