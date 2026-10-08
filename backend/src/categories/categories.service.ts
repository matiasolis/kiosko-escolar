import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.seedInitialCategories();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { orden: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const id = dto.id || `cat_${Date.now()}`;
    const category = this.categoryRepository.create({
      id,
      nombre: dto.nombre,
      icono: dto.icono || 'CupSoda',
      activa: dto.activa ?? true,
      orden: dto.orden ?? 0,
    });
    return this.categoryRepository.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  private async seedInitialCategories() {
    try {
      const count = await this.categoryRepository.count();
      if (count === 0) {
        const defaultCategories = [
          { id: 'cat_bebidas', nombre: 'Bebidas', icono: 'CupSoda', activa: true, orden: 1 },
          { id: 'cat_snacks', nombre: 'Snacks y Galletitas', icono: 'Cookie', activa: true, orden: 2 },
          { id: 'cat_golosinas', nombre: 'Golosinas y Chocolates', icono: 'Candy', activa: true, orden: 3 },
          { id: 'cat_saludable', nombre: 'Opciones Saludables', icono: 'Apple', activa: true, orden: 4 },
          { id: 'cat_comida', nombre: 'Comidas Rápidas', icono: 'Utensils', activa: true, orden: 5 },
        ];
        await this.categoryRepository.save(defaultCategories);
        console.log('✅ Categorías iniciales sembradas');
      }
    } catch (err) {
      console.warn('⚠️ No se pudieron sembrar categorías:', (err as Error).message);
    }
  }
}
