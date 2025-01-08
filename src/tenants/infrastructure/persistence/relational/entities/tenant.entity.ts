
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { User } from '../../../../../users/domain/user';

@Entity({
  name: 'tenant',
})
export class TenantEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Unique Tenant ID

  @Column()
  name: string; // Loan Agency Name

  @Column({ nullable: true })
  registrationNumber: string | null; // Optional Registration Number, can be null

  @Column({ nullable: true })
  address: string | null; // Optional Physical Address, can be null

  @Column({ nullable: true })
  city: string | null; // Optional City or District, can be null

  @Column({ default: 'Uganda' })
  country: string; // Default to Uganda

  @Column({ nullable: true })
  phoneNumber: string | null; // Optional Agency Contact Number, can be null

  @Column({ nullable: true })
  email: string | null; // Optional Agency Contact Email, can be null

  @Column({ nullable: true })
  website: string | null; // Optional Agency Website, can be null

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null; // Optional additional information, can be null

  @OneToMany(() => User, (user) => user.tenant)
  users: User[]; // Relationship to Users

  @CreateDateColumn()
  createdAt: Date | null; // Optional Created Date, can be null

  @UpdateDateColumn()
  updatedAt: Date | null; // Optional Updated Date, can be null
}
