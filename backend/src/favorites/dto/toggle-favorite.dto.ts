import { IsString } from 'class-validator';

export class ToggleFavoriteDto {
  @IsString()
  propertyId!: string;
}
