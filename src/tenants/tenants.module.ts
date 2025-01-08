import { Module } from '@nestjs/common';
import { tenantsService } from './tenants.service';
import { tenantsController } from './tenants.controller';
import { RelationaltenantPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationaltenantPersistenceModule,
  ],
  controllers: [tenantsController],
  providers: [tenantsService],
  exports: [tenantsService, RelationaltenantPersistenceModule],
})
export class tenantsModule {}
