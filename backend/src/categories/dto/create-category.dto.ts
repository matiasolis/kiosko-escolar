import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  nombre: string;

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
