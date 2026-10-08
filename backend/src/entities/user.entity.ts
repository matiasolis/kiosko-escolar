import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 254,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'text',
    nullable: true,
  })
  passwordHash: string | null;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  firstName: string | null;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  lastName: string | null;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  displayName: string | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'cliente',
  })
  role: 'admin' | 'cliente';

  @Column({
    name: 'student_modality',
    type: 'varchar',
    length: 30,
    nullable: true,
    default: 'digital',
  })
  studentModality: 'digital' | 'colaborador' | null;

  @Column({
    name: 'is_blocked',
    type: 'boolean',
    default: false,
  })
  isBlocked: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}