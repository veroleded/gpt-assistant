import { Action, Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { Markup } from 'telegraf';
import { textModels } from 'src/chatgpt/models';

@Scene('menu')
export class MenuScene {
    constructor(
        private readonly sessionService: SessionService,
        private readonly userService: UserService,
    ) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        const userId = ctx.message.from.id;
        const session = await this.sessionService.findCurrentUserSession(userId);
        const message =
            'Что вы хотите поменять?\n' +
            `Текущая модель: ${session.model}\n` +
            `Текущий контекст:\n ${session.context ?? 'не задан'}`;
        await ctx.replyWithHTML(
            message,
            Markup.inlineKeyboard([
                Markup.button.callback('Задать контекст', 'context'),
                Markup.button.callback('Выбрать модель', 'models'),
                Markup.button.callback('Сохранить', 'save'),
            ]),
        );
    }

    @Action('context')
    async SetContext(@Ctx() ctx: SceneContext) {
        console.log('context');
        await ctx.scene.enter('set_context');
    }

    @Action('models')
    async setModel(@Ctx() ctx: SceneContext) {
        const buttons = Object.entries(textModels).map(([key, value]) => Markup.button.callback(value, key));
        await ctx.editMessageText(
            'Выберете модель',
            Markup.inlineKeyboard([buttons, [Markup.button.callback('Назад', 'back')]]),
        );
    }

    @Action('back')
    async back(@Ctx() ctx: SceneContext) {
        await ctx.editMessageText(
            'Выберете что вы хотите поменять',
            Markup.inlineKeyboard([
                Markup.button.callback('Задать контекст', 'context'),
                Markup.button.callback('Выбрать модель', 'models'),
                Markup.button.callback('Сохранить', 'save'),
            ]),
        );
    }

    @Action(Object.keys(textModels))
    async setModelAction(@Ctx() ctx: SceneContext) {
        const callbackQuery = ctx.callbackQuery;

        if ('data' in callbackQuery) {
            const userId = ctx.message.from.id;
            const session = await this.sessionService.findCurrentUserSession(userId);
            const newModel = textModels[callbackQuery.data];
            const newSession = await this.sessionService.update(session.id, { model: newModel });
            const message =
                'Что вы хотите поменять?\n' +
                `Текущая модель: ${newSession.model}\n` +
                `Текущий контекст:\n ${newSession.context ?? 'не задан'}`;
            await ctx.replyWithHTML(
                message,
                Markup.inlineKeyboard([
                    Markup.button.callback('Задать контекст', 'context'),
                    Markup.button.callback('Выбрать модель', 'models'),
                    Markup.button.callback('Сохранить', 'save'),
                ]),
            );
        } else {
            await ctx.reply('Произошла ошибка при выборе модели.');
        }
    }
}
