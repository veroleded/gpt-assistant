import { User } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class IUserEntity implements User {
    @IsString()
    id: string;
    @IsString()
    @IsNotEmpty()
    firstName: string;
    lastName: string;
    @IsString()
    @IsNotEmpty()
    username: string;
    languageCode: string;
    createAt: Date;
    updatedAt: Date;
}
