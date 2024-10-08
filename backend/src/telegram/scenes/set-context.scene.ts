import { Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';

@Scene('set_context')
export class SetContextScene {
    constructor(
        private readonly sessionService: SessionService,
        private readonly userService: UserService,
    ) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        ctx.reply('Какой ответ вы хотели бы получать от ChatGPT?');
    }

    // @On('text')
    // async onText(@Ctx() ctx: SceneContext, @Message('text') text: string) {
    //     const { id } = ctx.message.from;
    //     await this.sessionService.update(id, { context: text });
    //     await ctx.scene.enter('menu');
    // }
}
