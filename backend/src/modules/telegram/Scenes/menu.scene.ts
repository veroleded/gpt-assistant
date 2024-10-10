import { Action, Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/modules/session/session.service';
import { Markup } from 'telegraf';
import { textModels } from 'src/modules/chatgpt/models';

@Scene('menu')
export class MenuScene {
    constructor(private readonly sessionService: SessionService) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        const userId = ctx.message.from.id.toString();
        const session = await this.sessionService.findCurrentUserSession(userId);
        const message =
            'Настройки чата\n\n' +
            'Используйте кнопку сохранить что бы перейти к диалогу.\n\n' +
            `Текущая модель: ${session.model}\n` +
            `Тип ответа: ${session.voice ? 'голос' : 'текст'}\n` +
            `Текущий контекст:\n ${session.context ?? 'не задан'}`;
        const voiceButton = Markup.button.callback(
            `${session.voice ? 'Отключить' : 'Включить'} голосовой ответ`,
            'voice',
        );

        await ctx.reply(
            message,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback('Задать контекст', 'context'),
                    Markup.button.callback('Выбрать модель', 'models'),
                ],
                [voiceButton],
                [Markup.button.callback('Сохранить', 'save')],
            ]),
        );
    }

    @Action('context')
    async SetContext(@Ctx() ctx: SceneContext) {
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
        const callbackQuery = ctx.callbackQuery;

        if ('data' in callbackQuery) {
            const userId = callbackQuery.from.id.toString();
            const session = await this.sessionService.findCurrentUserSession(userId);
            const voiceButton = Markup.button.callback(
                `${session.voice ? 'Отключить' : 'Включить'} голосовой ответ`,
                'voice',
            );
            const message =
                'Настройки чата\n\n' +
                'Используйте кнопку сохранить чтобы перейти к диалогу.\n\n' +
                `Текущая модель: ${session.model}\n` +
                `Тип ответа: ${session.voice ? 'голос' : 'текст'}\n` +
                `Текущий контекст:\n ${session.context ?? 'не задан'}`;
            await ctx.editMessageText(
                message,
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback('Задать контекст', 'context'),
                        Markup.button.callback('Выбрать модель', 'models'),
                    ],
                    [voiceButton],
                    [Markup.button.callback('Сохранить', 'save')],
                ]),
            );
        } else {
            await ctx.reply('Произошла ошибка при выборе модели.');
        }
    }

    @Action(Object.keys(textModels))
    async setModelAction(@Ctx() ctx: SceneContext) {
        const callbackQuery = ctx.callbackQuery;

        if ('data' in callbackQuery) {
            const userId = callbackQuery.from.id.toString();
            const session = await this.sessionService.findCurrentUserSession(userId);
            const newModel = textModels[callbackQuery.data];
            const newSession = await this.sessionService.update(session.id, { model: newModel });
            const voiceButton = Markup.button.callback(
                `${session.voice ? 'Отключить' : 'Включить'} голосовой ответ`,
                'voice',
            );
            const message =
                'Настройки чата\n\n' +
                'Используйте кнопку сохранить чтобы перейти к диалогу.\n\n' +
                `Текущая модель: ${newSession.model}\n` +
                `Тип ответа: ${newSession.voice ? 'голос' : 'текст'}\n` +
                `Текущий контекст:\n ${newSession.context ?? 'не задан'}`;
            await ctx.editMessageText(
                message,
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback('Задать контекст', 'context'),
                        Markup.button.callback('Выбрать модель', 'models'),
                    ],
                    [voiceButton],
                    [Markup.button.callback('Сохранить', 'save')],
                ]),
            );
        } else {
            await ctx.reply('Произошла ошибка при выборе модели.');
        }
    }

    @Action('voice')
    async onVoice(@Ctx() ctx: SceneContext) {
        const callbackQuery = ctx.callbackQuery;

        if ('data' in callbackQuery) {
            const userId = callbackQuery.from.id.toString();
            const session = await this.sessionService.findCurrentUserSession(userId);
            const updatedSession = await this.sessionService.update(session.id, { voice: !session.voice });
            const message =
                'Настройки чата\n\n' +
                'Используйте кнопку сохранить чтобы перейти к диалогу.\n\n' +
                `Текущая модель: ${updatedSession.model}\n` +
                `Тип ответа: ${updatedSession.voice ? 'голос' : 'текст'}\n` +
                `Текущий контекст:\n ${updatedSession.context ?? 'не задан'}`;
            const voiceButton = Markup.button.callback(
                `${updatedSession.voice ? 'Отключить' : 'Включить'} голосовой ответ`,
                'voice',
            );

            await ctx.editMessageText(
                message,
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback('Задать контекст', 'context'),
                        Markup.button.callback('Выбрать модель', 'models'),
                    ],
                    [voiceButton],
                    [Markup.button.callback('Сохранить', 'save')],
                ]),
            );
        }
    }

    @Action('save')
    async save(@Ctx() ctx: SceneContext) {
        await ctx.reply('Настройки сохранены! Для изменения используйте команду /menu');
        await ctx.scene.enter('gpt_scene');
    }

    @On('text')
    async onText(@Ctx() ctx: SceneContext) {
        await ctx.reply('Для взаимодействия используйте кнпоки');
    }
}
