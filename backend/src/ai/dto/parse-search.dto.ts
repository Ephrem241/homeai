import { IsString, MaxLength, MinLength } from 'class-validator';

export class ParseSearchDto {
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  query!: string;
}
