import { Module } from '@nestjs/common';
import { FsService } from './files.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    providers: [FsService],
    exports: [FsService],
    imports: [HttpModule],
})
export class FsModule {}
