import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram-config.factory';
import { ChatgptModule } from 'src/modules/chatgpt/chatgpt.module';
import { UserModule } from 'src/modules/user/user.module';
import { SessionModule } from 'src/modules/session/session.module';
import { MessageModule } from 'src/modules/message/message.module';
import { FilesModule } from 'src/libs/files/files.module';
import { BalanceModule } from 'src/libs/balance/balance.module';
import { SettingsScene } from './scenes/settings.scene';
import { SetContextScene } from './scenes/set-context.scene';
import { GptScene } from './scenes/gpt.scene';

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
    providers: [TelegramService, SettingsScene, SetContextScene, GptScene],
})
export class TelegramModule {}
