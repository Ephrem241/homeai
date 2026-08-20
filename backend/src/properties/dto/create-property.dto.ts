import { PropertyPurpose, PropertyType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  agentId!: string;

  @IsEnum(PropertyType)
  type!: PropertyType;

  @IsEnum(PropertyPurpose)
  purpose!: PropertyPurpose;

  @IsString()
  countryId!: string;

  @IsString()
  cityId!: string;

  @IsOptional()
  @IsString()
  neighborhoodId?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
