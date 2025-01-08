import { Tenant as TenantDomain } from '../../../../domain/tenant';
import { TenantEntity } from '../entities/tenant.entity';

export class TenantMapper {
  // Converts the persistence entity (TenantEntity) to the domain model (TenantDomain)
  static toDomain(raw: TenantEntity): TenantDomain {
    const domainEntity = new TenantDomain();

    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.registrationNumber = raw.registrationNumber;
    domainEntity.address = raw.address;
    domainEntity.city = raw.city;
    domainEntity.country = raw.country || 'Uganda'; // Default to 'Uganda' if not provided
    domainEntity.phoneNumber = raw.phoneNumber;
    domainEntity.email = raw.email;
    domainEntity.website = raw.website;
    domainEntity.metadata = raw.metadata;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  // Converts the domain model (TenantDomain) to the persistence entity (TenantEntity)
  static toPersistence(domainEntity: TenantDomain): TenantEntity {
    const persistenceEntity = new TenantEntity();

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.registrationNumber = domainEntity.registrationNumber;
    persistenceEntity.address = domainEntity.address;
    persistenceEntity.city = domainEntity.city;
    persistenceEntity.country = domainEntity.country;
    persistenceEntity.phoneNumber = domainEntity.phoneNumber;
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.website = domainEntity.website;
    persistenceEntity.metadata = domainEntity.metadata;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
