import { Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/modules/session/session.service';
import { UserService } from 'src/modules/user/user.service';

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
            id: id.toString(),
            firstName: first_name,
            lastName: last_name,
            languageCode: language_code,
            username,
        });
        const oldSession = await this.sessionService.findCurrentUserSession(id.toString());
        if (oldSession) {
            ctx.session;
            await ctx.scene.enter('menu');
            return;
        }
        await this.sessionService.create(id.toString());
        await ctx.replyWithHTML(
            'Привет! Этот бот открывает вам доступ к лучшим нейросетям для создания текста, изображений, написания кода и других задач.\n' +
                'Доступные модели: OpenAI o1, GPT-4o, DALL•E 3 и другие.\n' +
                'Чатбот умеет:\n' +
                '1. Писать и переводить тексты\n' +
                '2. Создавать изображения\n' +
                '3. Писать и редактировать код\n' +
                '4. Решать задачи по математике\n' +
                'Чат принимает как текстовые запросы и ответы так и голосовые.',
        );

        await ctx.scene.enter('menu');
    }

    @On('text')
    async onText(@Ctx() ctx: SceneContext) {
        await ctx.reply('Для взаимодействия используйте кнпоки');
    }
}
