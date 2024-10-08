import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram-config.factory';
import { ChatgptModule } from 'src/chatgpt/chatgpt.module';
import { FilesModule } from 'src/files/files.module';
import { UserModule } from 'src/user/user.module';
import { SessionModule } from 'src/session/session.module';
import { MessageModule } from 'src/message/message.module';
import { StartScene } from './scenes/start.scene';
import { MenuScene } from './scenes/menu.scene';
import { SetContextScene } from './Scenes/set-context.scene';
import { GptScene } from './Scenes/gpt.scene';

@Module({
    imports: [
        TelegrafModule.forRootAsync(options()),
        ChatgptModule,
        FilesModule,
        UserModule,
        SessionModule,
        MessageModule,
    ],
    providers: [TelegramService, StartScene, MenuScene, SetContextScene, GptScene],
})
export class TelegramModule {}
