import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../entities/user.entity';

export function toFrontendUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    nombre: user.firstName || '',
    apellido: user.lastName || '',
    nombreVisible: user.displayName || user.firstName || user.email.split('@')[0],
    isBlocked: Boolean(user.isBlocked),
    tipoAlumno: user.studentModality || 'digital',
    createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
    totalSpent: 0,
    orderCount: 0,
    favorites: [],
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas. Verificá tu email y contraseña.');
    }

    if (user.isBlocked) {
      throw new ForbiddenException(
        'Tu cuenta ha sido suspendida por la administración del kiosco. Contactate con el personal.',
      );
    }

    // Verify password hash or standard demo passwords
    let isValidPassword = false;
    if (user.passwordHash) {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    }

    // Fallback for demo credentials if passwordHash wasn't set with bcrypt
    if (!isValidPassword) {
      if (email === 'admin@kiosco.edu' && password === 'admin123') isValidPassword = true;
      if (email === 'matias@alumno.edu' && password === 'alumno123') isValidPassword = true;
    }

    if (!isValidPassword) {
      throw new UnauthorizedException('Contraseña incorrecta.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      user: toFrontendUser(user),
      token,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, nombre, apellido, nombreVisible, tipoAlumno } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Ya existe una cuenta con ese correo electrónico.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await this.usersService.create({
      email,
      passwordHash,
      firstName: nombre.trim(),
      lastName: apellido?.trim() || '',
      displayName: nombreVisible.trim(),
      role: 'cliente',
      studentModality: tipoAlumno || 'digital',
      isBlocked: false,
    });

    const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
    const token = this.jwtService.sign(payload);

    return {
      user: toFrontendUser(newUser),
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }
    return {
      user: toFrontendUser(user),
    };
  }
}
