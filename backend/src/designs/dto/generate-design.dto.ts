import { IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateDesignDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  originalImage!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  roomType!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  style!: string;
}
