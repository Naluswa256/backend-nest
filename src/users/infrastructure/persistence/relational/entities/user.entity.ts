import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { IsEnum } from 'class-validator';
import { TenantEntity } from '../../../../../tenants/infrastructure/persistence/relational/entities/tenant.entity';
import { UserRole } from '../../../../../roles/roles.enum';
import { Tenant } from '../../../../../tenants/domain/tenant';

@Entity('users')
export class UserEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Unique User ID

  @Column()
  email: string; // Login Email

  @Column()
  password: string; // Hashed Password

  @Column()
  firstName: string; // First Name

  @Column()
  lastName: string; // Last Name

  @Column({ nullable: true })
  phoneNumber: string | null; // Phone Number (can be null)

  @Column()
  @IsEnum(UserRole) // Validation for role
  role: UserRole; // Enum: 'ADMIN', 'MANAGER', 'LOAN_OFFICER'

  @ManyToOne(() => TenantEntity, (tenant) => tenant.users)
  tenant: Tenant; // Reference to Tenant
  @Column({ nullable: true })
  createdBy: string | null;
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null; // Additional Information

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
