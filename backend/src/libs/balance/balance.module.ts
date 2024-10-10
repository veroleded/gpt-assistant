import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    providers: [BalanceService],
    exports: [BalanceService],
})
export class BalanceModule {}
