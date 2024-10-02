import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram-config.factory';
import { ChatgptModule } from 'src/chatgpt/chatgpt.module';
import { FilesModule } from 'src/files/files.module';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [TelegrafModule.forRootAsync(options()), ChatgptModule, FilesModule, UserModule],
    providers: [TelegramService],
})
export class TelegramModule {}
