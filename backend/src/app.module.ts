import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';
import { ChatgptModule } from './chatgpt/chatgpt.module';
import { FilesModule } from './files/files.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), TelegramModule, ChatgptModule, FilesModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
