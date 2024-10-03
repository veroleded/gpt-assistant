import { User } from '@prisma/client';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class IUserEntity implements User {
  @IsInt()
  id: number;
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
