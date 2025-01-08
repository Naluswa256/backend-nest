import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  CreateAdminDto,
  CreateLoanOfficerDto,
  CreateManagerDto,
} from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { User } from './domain/user';
import bcrypt from 'bcryptjs';
import { FilesService } from '../files/files.service';
import { UserRole } from '../roles/roles.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { tenantsService } from '../tenants/tenants.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly filesService: FilesService,
    private readonly tenantService: tenantsService,
  ) {}
  async create(createAdminDto: CreateAdminDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findByEmail(
      createAdminDto.email,
    );
    if (existingUser) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'emailAlreadyExists',
        },
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createAdminDto.password, salt);

    // Create tenant
    const tenant = await this.tenantService.create({
      name: createAdminDto.tenantName,
    });

    if (!tenant) {
      throw new InternalServerErrorException('Tenant creation failed.');
    }

    // Create user associated with the tenant
    return await this.usersRepository.create({
      firstName: createAdminDto.firstName,
      lastName: createAdminDto.lastName,
      email: createAdminDto.email,
      password: hashedPassword,
      phoneNumber: createAdminDto.phoneNumber,
      tenant: tenant, // Associate user with the tenant
      role: UserRole.ADMIN, // Assign role
    });
  }
  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    return this.usersRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: User['id']): Promise<NullableType<User>> {
    return this.usersRepository.findById(id);
  }

  findByIds(ids: User['id'][]): Promise<User[]> {
    return this.usersRepository.findByIds(ids);
  }

  findByEmail(email: User['email']): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.remove(id);
  }

  async createManager(
    createManagerDto: CreateManagerDto,
    adminId: string,
  ): Promise<User> {
    // Retrieve admin user to access their tenant
    const adminUser = await this.usersRepository.findById(adminId);
    if (!adminUser) {
      throw new NotFoundException('Admin not found');
    }

    const tenant = adminUser.tenant;
    if (!tenant) {
      throw new UnprocessableEntityException(
        'Admin does not belong to any tenant',
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createManagerDto.password, salt);

    // Check for existing email
    const existingUser = await this.usersRepository.findByEmail(
      createManagerDto.email,
    );
    if (existingUser) {
      throw new UnprocessableEntityException('Email already exists');
    }

    // Prepare metadata
    const metadata = {
      department: createManagerDto.department,
      reportsTo: createManagerDto.reportsTo,
    };

    // Create user with tenant
    return this.usersRepository.create({
      email: createManagerDto.email,
      password: hashedPassword,
      firstName: createManagerDto.firstName,
      lastName: createManagerDto.lastName,
      phoneNumber: createManagerDto.phoneNumber || null,
      role: UserRole.MANAGER, // Assuming "manager" is a valid role ID
      metadata,
      tenant, // Associate the tenant with the new user
      createdBy: adminId, // Track who created this user
    });
  }

  async createLoanOfficer(
    createLoanOfficerDto: CreateLoanOfficerDto,
    adminId: string,
  ): Promise<User> {
    // Retrieve admin user to access their tenant
    const adminUser = await this.usersRepository.findById(adminId);
    if (!adminUser) {
      throw new NotFoundException('Admin not found');
    }

    const tenant = adminUser.tenant;
    if (!tenant) {
      throw new UnprocessableEntityException(
        'Admin does not belong to any tenant',
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(
      createLoanOfficerDto.password,
      salt,
    );

    // Check for existing email
    const existingUser = await this.usersRepository.findByEmail(
      createLoanOfficerDto.email,
    );
    if (existingUser) {
      throw new UnprocessableEntityException('Email already exists');
    }

    // Prepare metadata
    const metadata = {
      branch: createLoanOfficerDto.branch,
      fieldWorkAreas: createLoanOfficerDto.fieldWorkAreas,
    };

    // Create user with tenant
    return this.usersRepository.create({
      email: createLoanOfficerDto.email,
      password: hashedPassword,
      firstName: createLoanOfficerDto.firstName,
      lastName: createLoanOfficerDto.lastName,
      role: UserRole.LOAN_OFFICER, // Assuming "loan_officer" is a valid role ID
      metadata,
      tenant, // Associate the tenant with the new user
      createdBy: adminId, // Track who created this user
    });
  }
}
