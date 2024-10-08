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
        const oldSession = await this.sessionService.findCurrentUserSession(id);
        if (oldSession) {
            ctx.session;
            await ctx.scene.enter('menu');
            return;
        }
        await this.sessionService.create(id);
        await ctx.replyWithHTML(`Привет! Этот бот открывает вам доступ к лучшим нейросетям для создания текста, изображений, написания кода и других задач.<br/>
                                 Здесь доступны новые модели: OpenAI o1, GPT-4o, DALL•E 3 и другие.\n
                                 Чатбот умеет:\n
                                 1. Писать и переводить тексты\n
                                 2. Создавать изображения\n
                                 3. Писать и редактировать код\n
                                 4. Решать задачи по математике\n
                                 Чат принимает как текстовые промты так и голосовые.`);

        await ctx.scene.enter('menu');
    }
}
