import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    await this.seedInitialProducts();
  }

  async findAll(categoriaId?: string): Promise<Product[]> {
    if (categoriaId) {
      return this.productRepository.find({
        where: { categoriaId },
        order: { nombre: 'ASC' },
      });
    }
    return this.productRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const id = dto.id || `prod_${Date.now()}`;
    const product = this.productRepository.create({
      ...dto,
      id,
      marca: dto.marca || '',
      descripcion: dto.descripcion || '',
      imagen: dto.imagen || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      stockMinimo: dto.stockMinimo ?? 5,
      sku: dto.sku || `SKU-${Date.now().toString().slice(-4)}`,
      estado: dto.estado || (dto.stock > 0 ? 'disponible' : 'agotado'),
      destacado: dto.destacado ?? false,
      enPromocion: dto.enPromocion ?? false,
    });
    return this.productRepository.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);

    // Auto-update estado according to stock if not explicitly set
    if (dto.stock !== undefined && !dto.estado) {
      if (product.stock <= 0) {
        product.estado = 'agotado';
      } else if (product.stock <= product.stockMinimo) {
        product.estado = 'stock_bajo';
      } else {
        product.estado = 'disponible';
      }
    }

    return this.productRepository.save(product);
  }

  async updateStock(id: string, delta: number): Promise<Product> {
    const product = await this.findOne(id);
    product.stock = Math.max(0, product.stock + delta);
    if (product.stock <= 0) {
      product.estado = 'agotado';
    } else if (product.stock <= product.stockMinimo) {
      product.estado = 'stock_bajo';
    } else {
      product.estado = 'disponible';
    }
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private async seedInitialProducts() {
    try {
      const count = await this.productRepository.count();
      if (count === 0) {
        const defaultProducts = [
          {
            id: 'prod_coca',
            nombre: 'Coca Cola 500ml',
            marca: 'Coca-Cola',
            categoriaId: 'cat_bebidas',
            descripcion: 'Gaseosa refrescante original en botella de 500ml.',
            imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500',
            precioCompra: 1200,
            precioVenta: 1800,
            stock: 24,
            stockMinimo: 6,
            sku: 'BEB-001',
            estado: 'disponible' as const,
            destacado: true,
            enPromocion: false,
          },
          {
            id: 'prod_agua',
            nombre: 'Agua Mineral 500ml',
            marca: 'Kin',
            categoriaId: 'cat_bebidas',
            descripcion: 'Agua mineral natural sin gas en envase eco-friendly.',
            imagen: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500',
            precioCompra: 600,
            precioVenta: 1000,
            stock: 30,
            stockMinimo: 10,
            sku: 'BEB-002',
            estado: 'disponible' as const,
            destacado: false,
            enPromocion: false,
          },
          {
            id: 'prod_alfajor_havanna',
            nombre: 'Alfajor Havanna Chocolate',
            marca: 'Havanna',
            categoriaId: 'cat_golosinas',
            descripcion: 'Alfajor premium relleno con abundante dulce de leche.',
            imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500',
            precioCompra: 1500,
            precioVenta: 2200,
            stock: 15,
            stockMinimo: 4,
            sku: 'GOL-001',
            estado: 'disponible' as const,
            destacado: true,
            enPromocion: false,
          },
          {
            id: 'prod_barrita',
            nombre: 'Barrita de Cereal Integramix',
            marca: 'Integramix',
            categoriaId: 'cat_saludable',
            descripcion: 'Barrita con avena, miel, frutos secos y semillas.',
            imagen: 'https://images.unsplash.com/photo-1622484212850-cab596d64936?w=500',
            precioCompra: 500,
            precioVenta: 800,
            stock: 20,
            stockMinimo: 5,
            sku: 'SAL-001',
            estado: 'disponible' as const,
            destacado: false,
            enPromocion: true,
            precioPromocional: 700,
          },
        ];
        await this.productRepository.save(defaultProducts);
        console.log('✅ Productos iniciales sembrados');
      }
    } catch (err) {
      console.warn('⚠️ No se pudieron sembrar productos:', (err as Error).message);
    }
  }
}
