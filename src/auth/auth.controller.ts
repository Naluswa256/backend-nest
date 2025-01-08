import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import {
  CreateAdminDto,
  CreateLoanOfficerDto,
  CreateManagerDto,
} from '../users/dto/create-user.dto';
import { Roles } from '../roles/roles.decorator';
import { UserRole } from '../roles/roles.enum';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { RefreshTokenDto } from './dto/refresh-token-dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-admin')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return await this.authService.createAdmin(createAdminDto);
  }
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
  @Post('create-manager')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async createManager(@Body() createManagerDto: CreateManagerDto, @Req() req) {
    const adminId = req.user.id; // Extract admin ID from the request
    return await this.authService.createManager(createManagerDto, adminId);
  }

  @Post('create-loan-officer')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async createLoanOfficer(
    @Body() createLoanOfficerDto: CreateLoanOfficerDto,
    @Req() req,
  ) {
    const adminId = req.user.id; // Extract admin ID from the request
    return await this.authService.createLoanOfficer(
      createLoanOfficerDto,
      adminId,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req) {
    const userPayload: JwtPayloadType = req.user; // JWT Payload is available in the request
    return await this.authService.me(userPayload);
  }
}
