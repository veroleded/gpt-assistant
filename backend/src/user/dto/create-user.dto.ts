import { IsInt, IsNotEmpty, IsString } from "class-validator";


export class CreateUserDto {
  @IsInt()
  id: number;

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
