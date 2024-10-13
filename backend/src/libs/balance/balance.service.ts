import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class BalanceService {
    constructor(private readonly configService: ConfigService) {}

    async getBalance() {
        const response = await axios(this.configService.get('BALANCE_URL'), {
            method: 'GET',
            headers: { Authorization: this.configService.get('OPENAI_API_KEY') },
        });

        return response.data.balance;
    }
}
