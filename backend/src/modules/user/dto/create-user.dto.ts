import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    id: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    lastName?: string;

    @IsString()
    username?: string;

    @IsString()
    languageCode?: string;
}