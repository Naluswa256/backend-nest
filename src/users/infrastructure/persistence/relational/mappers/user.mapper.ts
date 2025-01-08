import { User } from '../../../../domain/user';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    const domain = new User();
    domain.id = entity.id;
    domain.email = entity.email;
    domain.password = entity.password;
    domain.firstName = entity.firstName;
    domain.lastName = entity.lastName;
    domain.phoneNumber = entity.phoneNumber ?? null;
    domain.role = entity.role;
    domain.metadata = entity.metadata ?? null;
    domain.tenant = entity.tenant; // If tenant is loaded
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.createdBy = entity.createdBy;
    return domain;
  }

  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.password = domain.password;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.phoneNumber = domain.phoneNumber ?? null;
    entity.role = domain.role;
    entity.metadata = domain.metadata ?? null;
    entity.tenant = domain.tenant;
    entity.createdBy = domain.createdBy ?? null;
    return entity;
  }
}
