import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  recipientId!: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;
}
