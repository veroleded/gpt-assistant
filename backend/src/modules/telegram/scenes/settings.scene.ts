import { Action, Command, Ctx, Help, On, Scene, SceneEnter, Start } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/modules/session/session.service';
import { Markup } from 'telegraf';
import { textModels } from 'src/modules/chatgpt/models';
import { helpText, settingsText, startText } from '../texts';
import { BalanceService } from 'src/libs/balance/balance.service';

@Scene('settings')
export class SettingsScene {
    constructor(
        private readonly sessionService: SessionService,
        private readonly balanceService: BalanceService,
    ) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        const userId = ctx.message.from.id.toString();
        const session = await this.sessionService.findCurrentUserSession(userId);
        const message =
            settingsText +
            '\n\n' +
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
            ]),
        );
    }

    @Start()
    async onStart(@Ctx() ctx: SceneContext) {
        await ctx.replyWithHTML(startText);
    }

    @Help()
    async onHelp(@Ctx() ctx: SceneContext) {
        await ctx.replyWithHTML(helpText);
    }

    @Command('settings')
    async onSettings(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('settings');
    }

    @Command('deletecontext')
    async onContext(@Ctx() ctx: SceneContext) {
        const { id } = ctx.message.from;
        await this.sessionService.create(id.toString());
        await ctx.reply('Контекст отчищен!');
    }

    @Command('account')
    async onBalance(@Ctx() ctx: SceneContext) {
        const balance = await this.balanceService.getBalance();
        await ctx.reply(balance + ' рублей.');
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
                settingsText +
                '\n\n' +
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
                settingsText +
                '\n\n' +
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
                ]),
            );
        } else {
            await ctx.reply('Произошла ошибка при выборе модели.');
        }
    }

    @On('text')
    async onText(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('gpt_scene');
    }

    @On('voice')
    async onVoice(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('gpt_scene');
    }
}
