import { Injectable } from '@nestjs/common';
import { CreatetenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDTO } from './dto/update-tenant.dto';
import { tenantRepository } from './infrastructure/persistence/tenant.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Tenant } from './domain/tenant';

@Injectable()
export class tenantsService {
  constructor(
    // Dependencies here
    private readonly tenantRepository: tenantRepository,
  ) {}

  async create(createtenantDto: CreatetenantDto): Promise<Tenant> {
    // Create a new instance of the Tenant domain from the DTO
    const tenant = new Tenant();

    // Mapping fields from DTO to the domain model
    tenant.name = createtenantDto.name;
    tenant.registrationNumber = null; // Default to null, or you can omit if not required
    tenant.address = null; // Default to null
    tenant.city = null; // Default empty value or a placeholder
    tenant.country = 'Uganda'; // Default country
    tenant.phoneNumber = null; // Default to null if not provided
    tenant.email = null; // Default to null if not provided
    tenant.website = null; // Default to null if not provided
    tenant.metadata = {}; // Default to empty object or leave as null

    // Persist the new tenant to the database via the repository
    return await this.tenantRepository.create(tenant);
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.tenantRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Tenant['id']) {
    return this.tenantRepository.findById(id);
  }

  findByIds(ids: Tenant['id'][]) {
    return this.tenantRepository.findByIds(ids);
  }

  async update(
    id: Tenant['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updatetenantDto: UpdateTenantDTO,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.tenantRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Tenant['id']) {
    return this.tenantRepository.remove(id);
  }
}
