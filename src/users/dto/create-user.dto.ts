import { IsArray, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  tenantName: string; // Required to create the tenant
}
export class CreateManagerDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  department: string;

  @IsString()
  reportsTo: string; // Admin or another Manager ID
}
export class CreateLoanOfficerDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  branch: string;

  @IsArray()
  fieldWorkAreas: string[];
}
