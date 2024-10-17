import { Action, Command, Ctx, Help, On, Scene, SceneEnter, Start } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/modules/session/session.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { dialogEmptyText, dialogText, errorText, helpText, newText, startText } from '../texts';
import { BalanceService } from 'src/libs/balance/balance.service';
import { Markup, session } from 'telegraf';

@Scene('select_chat')
export class SelectChatScene {
    private readonly logger = new Logger(SelectChatScene.name);
    constructor(
        private readonly sessionService: SessionService,
        private readonly balanceService: BalanceService,
        private readonly configService: ConfigService,
    ) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        try {
            const userId = ctx.message.from.id.toString();
            const sessions = await this.sessionService.findAllUserSessions(userId, { take: 6 });

            if (sessions.length === 0) {
                await ctx.reply(dialogEmptyText);
                await ctx.scene.leave();
                return;
            }

            const sixSession = sessions.length === 6 ? sessions.pop() : null;
            const navButtons = [];
            if (sixSession) {
                const nextButton = sixSession && Markup.button.callback('След. страница', 'page 1');

                navButtons.push(nextButton);
            }

            const sessionsButtons = sessions.map((session) => {
                return [Markup.button.callback(session.name ?? 'Без названия', `id ${session.id}`)];
            });

            ctx.reply(dialogText, Markup.inlineKeyboard([...sessionsButtons, navButtons]));
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
    }

    @Action('back')
    async back(@Ctx() ctx: SceneContext) {
        try {
            const callbackQuery = ctx.callbackQuery;
            if ('data' in callbackQuery) {
                const userId = callbackQuery.from.id.toString();
                const sessions = await this.sessionService.findAllUserSessions(userId, { take: 6 });

                if (sessions.length === 0) {
                    await ctx.reply(dialogEmptyText);
                    await ctx.scene.leave();
                    return;
                }

                const sixSession = sessions.length === 6 ? sessions.pop() : null;
                const navButtons = [];
                if (sixSession) {
                    const nextButton = sixSession && Markup.button.callback('След. страница', 'page 1');

                    navButtons.push(nextButton);
                }

                const sessionsButtons = sessions.map((session) => {
                    return [Markup.button.callback(session.name ?? 'Без названия', `id ${session.id}`)];
                });

                ctx.editMessageText(dialogText, Markup.inlineKeyboard([...sessionsButtons, navButtons]));
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
    }

    @Action(/^page \d{1,}$/)
    async onNextPage(@Ctx() ctx: SceneContext) {
        try {
            const callbackQuery = ctx.callbackQuery;
            if ('data' in callbackQuery) {
                const userId = callbackQuery.from.id.toString();
                const page = Number(callbackQuery.data.split(' ')[1]);

                const sessions = await this.sessionService.findAllUserSessions(userId, { skip: page * 5, take: 6 });

                const navButtons = [];
                if (page > 0) {
                    const prevButton = page > 0 ? Markup.button.callback('Пред. страница', `page ${page - 1}`) : [];
                    navButtons.push(prevButton);
                }

                const sixSession = sessions.length === 6 ? sessions.pop() : null;
                if (sixSession) {
                    console.log(sixSession);
                    const nextButton = sixSession ? Markup.button.callback('След. страница', `page ${page + 1}`) : [];

                    navButtons.push(nextButton);
                }

                const sessionsButtons = sessions.map((session) => {
                    return [Markup.button.callback(session.name ?? 'Без названия', `id ${session.id}`)];
                });

                ctx.editMessageText(dialogText, Markup.inlineKeyboard([...sessionsButtons, navButtons]));
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
    }

    @Action(/id (\d|\w|\W){1,}/)
    async onSessionId(@Ctx() ctx: SceneContext) {
        try {
            const callbackQuery = ctx.callbackQuery;
            if ('data' in callbackQuery) {
                const id = callbackQuery.data.split(' ')[1];

                const session = await this.sessionService.findCurrentUserSession(id);

                const selectButton = Markup.button.callback('Выбрать', `select ${id}`);
                const deleteButton = Markup.button.callback('Удалить', `delete ${id}`);

                const text = `Диалог: ${session?.name ?? 'Без названия'}`;

                ctx.editMessageText(
                    text,
                    Markup.inlineKeyboard([[selectButton, deleteButton], [Markup.button.callback('Назад', 'back')]]),
                );
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
    }

    @Action(/select (\d|\w|\W){1,}/)
    async onSelect(@Ctx() ctx: SceneContext) {
        try {
            const callbackQuery = ctx.callbackQuery;
            if ('data' in callbackQuery) {
                const id = callbackQuery.data.split(' ')[1];
                const session = await this.sessionService.updateCurrentSession(id);
                await ctx.reply(`Вы выбрали диалог: ${session.name ?? 'Без названия'}`);
                await ctx.scene.leave();
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
    }

    @Action(/delete (\d|\w|\W){1,}/)
    async onDelete(@Ctx() ctx: SceneContext) {
        try {
            const callbackQuery = ctx.callbackQuery;
            if ('data' in callbackQuery) {
                const id = callbackQuery.data.split(' ')[1];
                await this.sessionService.remove(id);
                await this.back(ctx);
                await ctx.reply('Диалог удален');
            }
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
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

    @Command('chats')
    async onChats(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('select_chat');
    }

    @Command('deletecontext')
    async onContext(@Ctx() ctx: SceneContext) {
        try {
            const { id } = ctx.message.from;
            const session = await this.sessionService.findCurrentUserSession(id.toString());
            await this.sessionService.removeContext(session.id);
            await ctx.reply('Контекст отчищен!');
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
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
                await ctx.reply(errorText);
            }
        }
    }

    @Command('newchat')
    async onNew(@Ctx() ctx: SceneContext) {
        try {
            const userId = ctx.message.from.id;

            await this.sessionService.create(userId.toString());

            await ctx.reply(newText);
        } catch (error) {
            const isDev = this.configService.get('NODE_ENV') === 'dev';
            if (isDev) {
                this.logger.error(error);
                await ctx.reply(error.message);
            } else {
                await ctx.reply(errorText);
            }
        }
    }

    @Command('role')
    async onRole(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('set_role');
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
