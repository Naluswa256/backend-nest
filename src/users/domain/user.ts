import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UserRole } from '../../roles/roles.enum';
import { Tenant } from '../../tenants/domain/tenant';

export class User {
  @IsString()
  id: string; // Unique User ID

  @IsEmail()
  email: string; // Login Email

  @IsString()
  password: string; // Hashed Password

  @IsString()
  firstName: string; // First Name

  @IsString()
  lastName: string; // Last Name

  @IsOptional()
  @IsString()
  phoneNumber?: string | null; // Optional Phone Number
  @IsOptional()
  @IsString()
  createdBy?: string | null; // Optional Phone Number

  @IsEnum(UserRole)
  role: UserRole; // Enum: 'ADMIN', 'MANAGER', 'LOAN_OFFICER'

  @ValidateNested()
  tenant: Tenant; // Reference to Tenant (optional in the domain layer)

  @IsOptional()
  metadata?: Record<string, any> | null; // Additional Information

  @IsOptional()
  createdAt?: Date; // Optional Created Date

  @IsOptional()
  updatedAt?: Date; // Optional Updated Date
}
