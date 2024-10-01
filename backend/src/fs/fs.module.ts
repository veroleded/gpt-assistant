import { Module } from '@nestjs/common';
import { FsService } from './fs.service';

@Module({
    providers: [FsService],
    exports: [FsService],
})
export class FsModule {}
