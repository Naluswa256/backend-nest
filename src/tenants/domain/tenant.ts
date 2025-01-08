import {
  IsString,
  IsOptional,
  IsEmail,
  IsDate,
  IsNotEmpty,
} from 'class-validator';

export class Tenant {
  @IsString()
  id: string; // Unique identifier

  @IsString()
  @IsNotEmpty()
  name: string; // Loan agency name

  @IsOptional()
  @IsString()
  registrationNumber: string | null = null; // Optional registration number, can be null

  @IsOptional()
  @IsString()
  address: string | null = null; // Optional physical address, can be null

  @IsOptional()
  @IsString()
  city: string | null = null; // City or district, can be null

  @IsString()
  country: string = 'Uganda'; // Default country: Uganda

  @IsOptional()
  @IsString()
  phoneNumber: string | null = null; // Optional contact number, can be null

  @IsOptional()
  @IsEmail()
  email: string | null = null; // Optional contact email, can be null

  @IsOptional()
  @IsString()
  website: string | null = null; // Optional website URL, can be null

  @IsOptional()
  metadata: Record<string, any> | null = null; // Optional additional information, can be null

  @IsOptional()
  @IsDate()
  createdAt: Date | null = null; // Optional created date, can be null

  @IsOptional()
  @IsDate()
  updatedAt: Date | null = null; // Optional updated date, can be null
}
