import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class validateRefreshTokenDto {
  @IsNotEmpty()
  id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
