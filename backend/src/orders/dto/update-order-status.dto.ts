import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'])
  @IsOptional()
  estado?: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';

  @IsIn(['pendiente', 'confirmado', 'rechazado'])
  @IsOptional()
  estadoPago?: 'pendiente' | 'confirmado' | 'rechazado';

  @IsString()
  @IsOptional()
  comprobantePago?: string;
}
