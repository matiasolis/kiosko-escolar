import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  categoriaId?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precioCompra?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precioVenta?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockMinimo?: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  estado?: 'disponible' | 'stock_bajo' | 'agotado' | 'desactivado' | 'activo';

  @IsBoolean()
  @IsOptional()
  destacado?: boolean;

  @IsBoolean()
  @IsOptional()
  enPromocion?: boolean;

  @IsNumber()
  @IsOptional()
  precioPromocional?: number;

  @IsString()
  @IsOptional()
  fechaVencimiento?: string;

  @IsString()
  @IsOptional()
  proveedorId?: string;
}
