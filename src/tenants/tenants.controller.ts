import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { tenantsService } from './tenants.service';
import { CreatetenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDTO } from './dto/update-tenant.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Tenant as tenant } from './domain/tenant';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAlltenantsDto } from './dto/find-all-tenants.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'tenants',
  version: '1',
})
export class tenantsController {
  constructor(private readonly tenantsService: tenantsService) {}

  @Post()
  @ApiCreatedResponse({
    type: tenant,
  })
  create(@Body() createtenantDto: CreatetenantDto) {
    return this.tenantsService.create(createtenantDto);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(tenant),
  })
  async findAll(
    @Query() query: FindAlltenantsDto,
  ): Promise<InfinityPaginationResponseDto<tenant>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.tenantsService.findAllWithPagination({
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: tenant,
  })
  findById(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: tenant,
  })
  update(@Param('id') id: string, @Body() updatetenantDto: UpdateTenantDTO) {
    return this.tenantsService.update(id, updatetenantDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
