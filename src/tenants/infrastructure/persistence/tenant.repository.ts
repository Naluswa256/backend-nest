import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Tenant as tenant } from '../../domain/tenant';


export abstract class tenantRepository {
  abstract create(data: tenant): Promise<tenant>;
  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<tenant[]>;

  abstract findById(id: tenant['id']): Promise<NullableType<tenant>>;

  abstract findByIds(ids: tenant['id'][]): Promise<tenant[]>;

  abstract update(
    id: tenant['id'],
    payload: DeepPartial<tenant>,
  ): Promise<tenant | null>;

  abstract remove(id: tenant['id']): Promise<void>;
}
