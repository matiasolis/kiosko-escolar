import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedInitialUsers();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create({
      ...userData,
      email: userData.email?.toLowerCase().trim(),
    });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async setBlocked(id: string, isBlocked: boolean): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    user.isBlocked = isBlocked;
    return this.userRepository.save(user);
  }

  private async seedInitialUsers() {
    try {
      const count = await this.userRepository.count();
      if (count === 0) {
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        const alumnoPasswordHash = await bcrypt.hash('alumno123', 10);

        const admin = this.userRepository.create({
          email: 'admin@kiosco.edu',
          passwordHash: adminPasswordHash,
          firstName: 'Prof. Roberto',
          lastName: 'Gómez',
          displayName: 'Roberto',
          role: 'admin',
          studentModality: 'digital',
          isBlocked: false,
        });

        const alumno = this.userRepository.create({
          email: 'matias@alumno.edu',
          passwordHash: alumnoPasswordHash,
          firstName: 'Matías',
          lastName: 'Olís',
          displayName: 'Matias',
          role: 'cliente',
          studentModality: 'digital',
          isBlocked: false,
        });

        await this.userRepository.save([admin, alumno]);
        console.log('✅ Usuarios iniciales sembrados (admin@kiosco.edu, matias@alumno.edu)');
      }
    } catch (err) {
      console.warn('⚠️ No se pudieron sembrar usuarios (¿la base de datos aún no está accesible?):', (err as Error).message);
    }
  }
}
