import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram-config.factory';
import { ChatgptModule } from 'src/modules/chatgpt/chatgpt.module';
import { UserModule } from 'src/modules/user/user.module';
import { SessionModule } from 'src/modules/session/session.module';
import { MessageModule } from 'src/modules/message/message.module';
import { StartScene } from './scenes/start.scene';
import { MenuScene } from './scenes/menu.scene';
import { SetContextScene } from './scenes/set-context.scene';
import { GptScene } from './scenes/gpt.scene';
import { FilesModule } from 'src/libs/files/files.module';

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
