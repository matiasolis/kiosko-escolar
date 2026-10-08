import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  icono?: string;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;

  @IsNumber()
  @IsOptional()
  orden?: number;
}
