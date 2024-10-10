import { Role } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()
    role: Role;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    sessionId: string;
}
