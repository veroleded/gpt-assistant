import { VoiceName } from '@prisma/client';
import { IsBoolean, IsString } from 'class-validator';

export class CreateSessionDto {
    @IsString()
    model?: string;

    @IsString()
    context?: string;

    @IsBoolean()
    voice?: boolean;

    @IsBoolean()
    onContext?: boolean;

    @IsString()
    voiceName?: VoiceName;
}
