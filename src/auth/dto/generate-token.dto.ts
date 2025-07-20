import { IsEmail, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class GenerateTokenDto {
  @IsNotEmpty()
  id: Types.ObjectId;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
