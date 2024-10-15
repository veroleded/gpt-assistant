import { Action, Command, Ctx, Help, On, Scene, SceneEnter, Start } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/modules/session/session.service';
import { Markup } from 'telegraf';

import { helpText, startText, voiceSettingText } from '../texts';
import { BalanceService } from 'src/libs/balance/balance.service';
import { textModels } from 'src/modules/chatgpt/const/models';
import { VoiceName } from '@prisma/client';
import { createSettingText } from '../utils/create-setting-text';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Scene('settings')
export class SettingsScene {
    private readonly logger = new Logger(SettingsScene.name);

    constructor(
        private readonly sessionService: SessionService,
        private readonly balanceService: BalanceService,
        private readonly configService: ConfigService,
    ) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        try {
            const userId = ctx.message.from.id.toString();
            const session = await this.sessionService.findCurrentUserSession(userId);
            const message = createSettingText(session);

            await ctx.reply(
                message,
                Markup.inlineKeyboard([
                    [Markup.button.callback('Описание роли', 'role')],
                    [Markup.button.callback('Выбор модели', 'models')],
                    [Markup.button.callback('Голосовые ответы', 'voice')],
                    [Markup.button.callback(`${session.onContext ? '✅' : '❌'} Поддержка контекста`, 'context')],
                ]),
            );
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
    }

    @Action('role')
    async setRole(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('set_role');
    }

    @Action('models')
    async setModel(@Ctx() ctx: SceneContext) {
        try {
            const buttons = Object.entries(textModels).map(([key, value]) => Markup.button.callback(value, key));
            await ctx.editMessageText(
                'Выберете модель',
                Markup.inlineKeyboard([buttons, [Markup.button.callback('Назад', 'back')]]),
            );
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
    }

    @Action('context')
    async setContext(@Ctx() ctx: SceneContext) {
        try {
            const callbackQuery = ctx.callbackQuery;

            if ('data' in callbackQuery) {
                const userId = callbackQuery.from.id.toString();
                const session = await this.sessionService.findCurrentUserSession(userId);

                const newSession = await this.sessionService.update(session.id, {
                    onContext: !session.onContext,
                });
                const message = createSettingText(newSession);

                await ctx.editMessageText(
                    message,
                    Markup.inlineKeyboard([
                        [Markup.button.callback('Описание роли', 'role')],
                        [Markup.button.callback('Выбор модели', 'models')],
                        [Markup.button.callback('Голосовые ответы', 'voice')],
                        [
                            Markup.button.callback(
                                `${newSession.onContext ? '✅' : '❌'} Поддержка контекста`,
                                'context',
                            ),
                        ],
                    ]),
                );
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
    }

    @Action('voice')
    async setVoiceAction(@Ctx() ctx: SceneContext) {
        try {
            const callbackQuery = ctx.callbackQuery;

            if ('data' in callbackQuery) {
                const userId = callbackQuery.from.id.toString();
                const { voice } = await this.sessionService.findCurrentUserSession(userId);

                const buttons = Object.entries(VoiceName).map(([key, value]) => Markup.button.callback(value, key));
                await ctx.editMessageText(
                    voiceSettingText,
                    Markup.inlineKeyboard([
                        [Markup.button.callback(`${voice ? '✅' : '❌'} Голосовые ответы`, 'onVoice')],
                        buttons,
                        [Markup.button.callback('Назад', 'back')],
                    ]),
                );
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
    }

    @Action('onVoice')
    async onVoiceSwap(@Ctx() ctx: SceneContext) {
        try {
            const callbackQuery = ctx.callbackQuery;

            if ('data' in callbackQuery) {
                const userId = callbackQuery.from.id.toString();
                const session = await this.sessionService.findCurrentUserSession(userId);

                const { voice } = await this.sessionService.update(session.id, { voice: !session.voice });

                const buttons = Object.entries(VoiceName).map(([key, value]) => Markup.button.callback(value, key));
                await ctx.editMessageText(
                    voiceSettingText,
                    Markup.inlineKeyboard([
                        [Markup.button.callback(`${voice ? '✅' : '❌'} Голосовые ответы`, 'onVoice')],
                        buttons,
                        [Markup.button.callback('Назад', 'back')],
                    ]),
                );
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
    }

    @Action(Object.keys(VoiceName))
    async setVoice(@Ctx() ctx: SceneContext) {
        try {
            const callbackQuery = ctx.callbackQuery;

            if ('data' in callbackQuery) {
                const userId = callbackQuery.from.id.toString();
                const session = await this.sessionService.findCurrentUserSession(userId);
                const voiceName = VoiceName[callbackQuery.data];
                const newSession = await this.sessionService.update(session.id, {
                    voiceName,
                });

                const message = createSettingText(newSession);

                await ctx.editMessageText(
                    message,
                    Markup.inlineKeyboard([
                        [Markup.button.callback('Описание роли', 'role')],
                        [Markup.button.callback('Выбор модели', 'models')],
                        [Markup.button.callback('Голосовые ответы', 'voice')],
                        [
                            Markup.button.callback(
                                `${newSession.onContext ? '✅' : '❌'} Поддержка контекста`,
                                'context',
                            ),
                        ],
                    ]),
                );
            } else {
                await ctx.reply('Произошла ошибка при выборе модели.');
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
    }

    @Action('back')
    async back(@Ctx() ctx: SceneContext) {
        try {
            const callbackQuery = ctx.callbackQuery;

            if ('data' in callbackQuery) {
                const userId = callbackQuery.from.id.toString();
                const session = await this.sessionService.findCurrentUserSession(userId);
                const message = createSettingText(session);

                await ctx.editMessageText(
                    message,
                    Markup.inlineKeyboard([
                        [Markup.button.callback('Описание роли', 'role')],
                        [Markup.button.callback('Выбор модели', 'models')],
                        [Markup.button.callback('Голосовые ответы', 'voice')],
                        [Markup.button.callback(`${session.onContext ? '✅' : '❌'} Поддержка контекста`, 'context')],
                    ]),
                );
            } else {
                await ctx.reply('Произошла ошибка при выборе модели.');
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
    }

    @Action(Object.keys(textModels))
    async setModelAction(@Ctx() ctx: SceneContext) {
        try {
            const callbackQuery = ctx.callbackQuery;

            if ('data' in callbackQuery) {
                const userId = callbackQuery.from.id.toString();
                const session = await this.sessionService.findCurrentUserSession(userId);
                const newModel = textModels[callbackQuery.data];
                const newSession = await this.sessionService.update(session.id, {
                    model: newModel,
                });

                const message = createSettingText(newSession);

                await ctx.editMessageText(
                    message,
                    Markup.inlineKeyboard([
                        [Markup.button.callback('Описание роли', 'role')],
                        [Markup.button.callback('Выбор модели', 'models')],
                        [Markup.button.callback('Голосовые ответы', 'voice')],
                        [
                            Markup.button.callback(
                                `${newSession.onContext ? '✅' : '❌'} Поддержка контекста`,
                                'context',
                            ),
                        ],
                    ]),
                );
            } else {
                await ctx.reply('Произошла ошибка при выборе модели.');
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
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
        try {
            const { id } = ctx.message.from;
            await this.sessionService.create(id.toString());
            await ctx.reply('Контекст отчищен!');
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
        }
    }

    @Command('account')
    async onBalance(@Ctx() ctx: SceneContext) {
        try {
            const balance = await this.balanceService.getBalance();
            await ctx.reply(balance + ' рублей.');
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply('Что-то пошло нет так');
            }
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
