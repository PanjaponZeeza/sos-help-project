import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateActionDto {
  @IsMongoId()
  @IsNotEmpty()
  sosId: string;

  @IsString()
  @IsNotEmpty()
  actionDetail: string;
}