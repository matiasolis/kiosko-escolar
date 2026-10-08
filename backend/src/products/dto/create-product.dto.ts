import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  nombre: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  categoriaId: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  imagen?: string;

  @IsNumber()
  @Min(0)
  precioCompra: number;

  @IsNumber()
  @Min(0)
  precioVenta: number;

  @IsNumber()
  @Min(0)
  stock: number;

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
