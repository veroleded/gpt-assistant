import { VoiceName } from '@prisma/client';
import { IsBoolean, IsString } from 'class-validator';

export class CreateSessionDto {
    @IsString()
    name?: string;

    @IsString()
    model?: string;

    @IsString()
    assistantRole?: string;

    @IsBoolean()
    voice?: boolean;

    @IsBoolean()
    onContext?: boolean;

    @IsString()
    voiceName?: VoiceName;

    @IsString()
    imageStyle?: string;

    @IsString()
    imageSize?: string;
}
