import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class VerifyMailDto {
  @IsString()
  @IsNotEmpty()
  readonly to: string;

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly url: string;

  @IsNumber()
  @IsOptional()
  readonly year: number = new Date().getFullYear();
}
