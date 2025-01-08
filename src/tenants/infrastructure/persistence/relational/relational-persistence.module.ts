import { Module } from '@nestjs/common';
import { tenantRepository } from '../tenant.repository';
import { tenantRelationalRepository } from './repositories/tenant.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  providers: [
    {
      provide: tenantRepository,
      useClass: tenantRelationalRepository,
    },
  ],
  exports: [tenantRepository],
})
export class RelationaltenantPersistenceModule {}
