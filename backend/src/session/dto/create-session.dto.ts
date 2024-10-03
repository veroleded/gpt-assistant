import { Session } from '@prisma/client';
import { IsString } from 'class-validator';

export class CreateSessionDto {
    @IsString()
    model?: string;
    @IsString()
    context?: string;
}
