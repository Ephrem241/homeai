import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SaveDesignDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  originalImage!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  generatedImage!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  roomType!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  style!: string;
}
