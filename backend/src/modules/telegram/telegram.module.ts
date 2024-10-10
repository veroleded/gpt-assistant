import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram-config.factory';
import { ChatgptModule } from 'src/modules/chatgpt/chatgpt.module';
import { UserModule } from 'src/modules/user/user.module';
import { SessionModule } from 'src/modules/session/session.module';
import { MessageModule } from 'src/modules/message/message.module';
import { StartScene } from './scenes/start.scene.js';
import { MenuScene } from './scenes/menu.scene.js';
import { SetContextScene } from './scenes/set-context.scene.js';
import { GptScene } from './scenes/gpt.scene.js';
import { FilesModule } from 'src/libs/files/files.module';
import { BalanceModule } from 'src/libs/balance/balance.module';

@Module({
    imports: [
        TelegrafModule.forRootAsync(options()),
        ChatgptModule,
        FilesModule,
        UserModule,
        SessionModule,
        MessageModule,
        BalanceModule,
    ],
    providers: [TelegramService, StartScene, MenuScene, SetContextScene, GptScene],
})
export class TelegramModule {}
