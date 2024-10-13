import { Ctx, Message, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { SessionService } from 'src/modules/session/session.service';
import { UserService } from 'src/modules/user/user.service';
import { FilesService } from 'src/libs/files/files.service';
import { ChatgptService } from 'src/modules/chatgpt/chatgpt.service';

@Scene('set_role')
export class SetRoleScene {
    constructor(
        private readonly sessionService: SessionService,
        private readonly userService: UserService,
        private readonly filesService: FilesService,
        private readonly chatgptService: ChatgptService,
    ) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        ctx.editMessageText(
            'Опишите текстом или голосовым сообщением как должен вести себя бот. Пример описания:\n' +
                'Отвечай как будто ты великий математик.',
        );
    }

    @On('text')
    async onText(@Ctx() ctx: SceneContext, @Message('text') text: string) {
        const { id } = ctx.message.from;
        const session = await this.sessionService.findCurrentUserSession(id.toString());
        await this.sessionService.update(session.id, { context: text });

        await ctx.reply('Сохранено!');
        await ctx.scene.enter('settings');
    }

    @On('voice')
    async onVoice(@Ctx() ctx: SceneContext, @Message('voice') voice: any) {
        const { id } = ctx.message.from;
        const fileLink = await ctx.telegram.getFileLink(voice.file_id);
        const filepath = await this.filesService.downloadFile(fileLink.href, id.toString(), 'ogg');
        const transcription = await this.chatgptService.transcription(filepath);
        const session = await this.sessionService.findCurrentUserSession(id.toString());
        await this.sessionService.update(session.id, { context: transcription });

        await ctx.reply('Сохранено!');
        await ctx.scene.enter('setttings');
    }
}
