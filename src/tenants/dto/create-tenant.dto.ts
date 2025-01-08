import { IsNotEmpty, IsString } from 'class-validator';

export class CreatetenantDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
