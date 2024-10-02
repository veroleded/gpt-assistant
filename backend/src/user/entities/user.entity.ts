import { User } from '@prisma/client';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class IUserEntity implements User {
  id: string;
  @IsInt()
  tgId: number;
  @IsString()
  @IsNotEmpty()
  firstName: string;
  lastName: string;
  @IsString()
  @IsNotEmpty()
  username: string;
  languageCode: string;
}
