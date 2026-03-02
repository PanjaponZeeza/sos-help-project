import { IsNotEmpty, IsNumber, IsString, IsPositive } from 'class-validator';

export class CreateSosDto {
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsNumber()
  @IsPositive()
  numberOfPeople: number;
}