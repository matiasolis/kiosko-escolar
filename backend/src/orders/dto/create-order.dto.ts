import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsString()
  @IsNotEmpty()
  productoNombre: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precioUnitario: number;

  @IsNumber()
  @IsOptional()
  costoUnitario?: number;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsString()
  @IsOptional()
  imagen?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  clienteId: string;

  @IsString()
  @IsNotEmpty()
  clienteNombre: string;

  @IsString()
  @IsNotEmpty()
  clienteVisible: string;

  @IsString()
  @IsNotEmpty()
  clienteEmail: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  @Min(0)
  total: number;

  @IsNumber()
  @IsOptional()
  costoTotal?: number;

  @IsNumber()
  @IsOptional()
  gananciaEstimada?: number;

  @IsIn(['efectivo', 'mercadopago', 'transferencia'])
  metodoPago: 'efectivo' | 'mercadopago' | 'transferencia';

  @IsIn(['pendiente', 'confirmado', 'rechazado'])
  @IsOptional()
  estadoPago?: 'pendiente' | 'confirmado' | 'rechazado';

  @IsIn(['inmediato', 'recreo'])
  modalidadRetiro: 'inmediato' | 'recreo';

  @IsString()
  @IsOptional()
  recreoDestino?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsString()
  @IsOptional()
  comprobantePago?: string;
}
