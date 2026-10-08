import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsOptional()
  apellido?: string;

  @IsString({ message: 'El nombre visible debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre visible es obligatorio' })
  nombreVisible: string;

  @IsString()
  @IsOptional()
  tipoAlumno?: 'digital' | 'colaborador';
}
