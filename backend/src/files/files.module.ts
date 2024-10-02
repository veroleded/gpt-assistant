import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    providers: [FilesService],
    exports: [FilesService],
    imports: [HttpModule],
})
export class FsModule {}
