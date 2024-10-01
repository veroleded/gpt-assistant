import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatgptService {
    private readonly logger = new Logger(ChatgptService.name);
    private gptUrl = '';
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.gptUrl = this.configService.get('PROXY_OPENAi_URL');
    }
}
