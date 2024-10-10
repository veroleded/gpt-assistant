import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './modules/telegram/telegram.module';
import { ChatgptModule } from './modules/chatgpt/chatgpt.module';
import { FilesModule } from './libs/files/files.module';
import { UserModule } from './modules/user/user.module';
import { MessageModule } from './modules/message/message.module';
import { SessionModule } from './modules/session/session.module';
import { BalanceModule } from './libs/balance/balance.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TelegramModule,
        ChatgptModule,
        FilesModule,
        UserModule,
        MessageModule,
        SessionModule,
        BalanceModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
