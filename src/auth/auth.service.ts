import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import ms from 'ms';

import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { NullableType } from '../utils/types/nullable.type';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { UsersService } from '../users/users.service';
import { AllConfigType } from '../config/config.type';
import { MailService } from '../mail/mail.service';
import { User } from '../users/domain/user';
import { AuthResponseDto } from './dto/login-response.dto';
import {
  CreateAdminDto,
  CreateLoanOfficerDto,
  CreateManagerDto,
} from '../users/dto/create-user.dto';
import { UserRole } from '../roles/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<
    AuthResponseDto<{
      token: string;
      refreshToken: string;
      tokenExpires: number;
      user: User;
    }>
  > {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        status: 'error',
        message: 'User not found',
        data: null,
      });
    }
    if (!user.password) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        status: 'error',
        message: 'Invalid credentials',
        data: null,
      });
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        status: 'error',
        message: 'Invalid credentials',
        data: null,
      });
    }
    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
      email: user.email,
      tenantId: user.tenant.id,
    });
    return {
      statusCode: HttpStatus.OK,
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        tokenExpires,
        user,
      },
    };
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<
    AuthResponseDto<{
      token: string;
      refreshToken: string;
      tokenExpires: number;
      admin: User;
    }>
  > {
    const admin = await this.usersService.create(createAdminDto);
    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: admin.id,
      role: admin.role,
      email: admin.email,
      tenantId: admin.tenant.id,
    });
    return {
      statusCode: HttpStatus.CREATED,
      status: 'success',
      message: 'Admin created successfully',
      data: {
        token,
        refreshToken,
        tokenExpires,
        admin,
      },
    };
  }

  async createManager(
    createManagerDto: CreateManagerDto,
    adminId: string,
  ): Promise<AuthResponseDto<User>> {
    const admin = await this.usersService.findById(adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        status: 'error',
        message: 'Admin not found or unauthorized',
        data: null,
      });
    }
    const manager = await this.usersService.createManager(
      createManagerDto,
      adminId,
    );
    return {
      statusCode: HttpStatus.CREATED,
      status: 'success',
      message: 'Manager created successfully',
      data: manager,
    };
  }

  async createLoanOfficer(
    createLoanOfficerDto: CreateLoanOfficerDto,
    adminId: string,
  ): Promise<AuthResponseDto<User>> {
    const admin = await this.usersService.findById(adminId);

    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        status: 'error',
        message: 'Admin not found or unauthorized',
        data: null,
      });
    }
    const loanOfficer = await this.usersService.createLoanOfficer(
      createLoanOfficerDto,
      adminId,
    );
    return {
      statusCode: HttpStatus.CREATED,
      status: 'success',
      message: 'Loan officer created successfully',
      data: loanOfficer,
    };
  }
  async refreshToken(oldRefreshToken: string): Promise<
    AuthResponseDto<{
      token: string;
      refreshToken: string;
      tokenExpires: number;
      user: User;
    }>
  > {
    const decoded = await this.jwtService.verifyAsync<JwtPayloadType>(
      oldRefreshToken,
      {
        secret: this.configService.getOrThrow('auth.refreshSecret', {
          infer: true,
        }),
      },
    );

    const user = await this.usersService.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant.id,
    });

    return {
      statusCode: 200,
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        token,
        refreshToken,
        tokenExpires,
        user,
      },
    };
  }
  //
  // async validateSocialLogin(
  //   authProvider: string,
  //   socialData: SocialInterface,
  // ): Promise<LoginResponseDto> {
  //   let user: NullableType<User> = null;
  //   const socialEmail = socialData.email?.toLowerCase();
  //   let userByEmail: NullableType<User> = null;
  //
  //   if (socialEmail) {
  //     userByEmail = await this.usersService.findByEmail(socialEmail);
  //   }
  //
  //   if (socialData.id) {
  //     user = await this.usersService.findBySocialIdAndProvider({
  //       socialId: socialData.id,
  //       provider: authProvider,
  //     });
  //   }
  //
  //   if (user) {
  //     if (socialEmail && !userByEmail) {
  //       user.email = socialEmail;
  //     }
  //     await this.usersService.update(user.id, user);
  //   } else if (userByEmail) {
  //     user = userByEmail;
  //   } else if (socialData.id) {
  //     const role = {
  //       id: RoleEnum.user,
  //     };
  //     const status = {
  //       id: StatusEnum.active,
  //     };
  //
  //     user = await this.usersService.create({
  //       email: socialEmail ?? null,
  //       firstName: socialData.firstName ?? null,
  //       lastName: socialData.lastName ?? null,
  //       socialId: socialData.id,
  //       provider: authProvider,
  //       role,
  //       status,
  //     });
  //
  //     user = await this.usersService.findById(user.id);
  //   }
  //
  //   if (!user) {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         user: 'userNotFound',
  //       },
  //     });
  //   }
  //
  //   const hash = crypto
  //     .createHash('sha256')
  //     .update(randomStringGenerator())
  //     .digest('hex');
  //
  //   const session = await this.sessionService.create({
  //     user,
  //     hash,
  //   });
  //
  //   const {
  //     token: jwtToken,
  //     refreshToken,
  //     tokenExpires,
  //   } = await this.getTokensData({
  //     id: user.id,
  //     role: user.role,
  //     sessionId: session.id,
  //     hash,
  //   });
  //
  //   return {
  //     refreshToken,
  //     token: jwtToken,
  //     tokenExpires,
  //     user,
  //   };
  // }

  // async confirmEmail(hash: string): Promise<void> {
  //   let userId: User['id'];
  //
  //   try {
  //     const jwtData = await this.jwtService.verifyAsync<{
  //       confirmEmailUserId: User['id'];
  //     }>(hash, {
  //       secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
  //         infer: true,
  //       }),
  //     });
  //
  //     userId = jwtData.confirmEmailUserId;
  //   } catch {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         hash: `invalidHash`,
  //       },
  //     });
  //   }
  //
  //   const user = await this.usersService.findById(userId);
  //
  //   if (
  //     !user ||
  //     user?.status?.id?.toString() !== StatusEnum.inactive.toString()
  //   ) {
  //     throw new NotFoundException({
  //       status: HttpStatus.NOT_FOUND,
  //       error: `notFound`,
  //     });
  //   }
  //
  //   user.status = {
  //     id: StatusEnum.active,
  //   };
  //
  //   await this.usersService.update(user.id, user);
  // }

  // async confirmNewEmail(hash: string): Promise<void> {
  //   let userId: User['id'];
  //   let newEmail: User['email'];
  //
  //   try {
  //     const jwtData = await this.jwtService.verifyAsync<{
  //       confirmEmailUserId: User['id'];
  //       newEmail: User['email'];
  //     }>(hash, {
  //       secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
  //         infer: true,
  //       }),
  //     });
  //
  //     userId = jwtData.confirmEmailUserId;
  //     newEmail = jwtData.newEmail;
  //   } catch {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         hash: `invalidHash`,
  //       },
  //     });
  //   }
  //
  //   const user = await this.usersService.findById(userId);
  //
  //   if (!user) {
  //     throw new NotFoundException({
  //       status: HttpStatus.NOT_FOUND,
  //       error: `notFound`,
  //     });
  //   }
  //
  //   user.email = newEmail;
  //   user.status = {
  //     id: StatusEnum.active,
  //   };
  //
  //   await this.usersService.update(user.id, user);
  // }

  // async forgotPassword(email: string): Promise<void> {
  //   const user = await this.usersService.findByEmail(email);
  //
  //   if (!user) {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         email: 'emailNotExists',
  //       },
  //     });
  //   }
  //
  //   const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
  //     infer: true,
  //   });
  //
  //   const tokenExpires = Date.now() + ms(tokenExpiresIn);
  //
  //   const hash = await this.jwtService.signAsync(
  //     {
  //       forgotUserId: user.id,
  //     },
  //     {
  //       secret: this.configService.getOrThrow('auth.forgotSecret', {
  //         infer: true,
  //       }),
  //       expiresIn: tokenExpiresIn,
  //     },
  //   );
  //
  //   await this.mailService.forgotPassword({
  //     to: email,
  //     data: {
  //       hash,
  //       tokenExpires,
  //     },
  //   });
  // }

  // async resetPassword(hash: string, password: string): Promise<void> {
  //   let userId: User['id'];
  //
  //   try {
  //     const jwtData = await this.jwtService.verifyAsync<{
  //       forgotUserId: User['id'];
  //     }>(hash, {
  //       secret: this.configService.getOrThrow('auth.forgotSecret', {
  //         infer: true,
  //       }),
  //     });
  //
  //     userId = jwtData.forgotUserId;
  //   } catch {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         hash: `invalidHash`,
  //       },
  //     });
  //   }
  //
  //   const user = await this.usersService.findById(userId);
  //
  //   if (!user) {
  //     throw new UnprocessableEntityException({
  //       status: HttpStatus.UNPROCESSABLE_ENTITY,
  //       errors: {
  //         hash: `notFound`,
  //       },
  //     });
  //   }
  //
  //   user.password = password;
  //
  //   await this.sessionService.deleteByUserId({
  //     userId: user.id,
  //   });
  //
  //   await this.usersService.update(user.id, user);
  // }

  async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.usersService.findById(userJwtPayload.id);
  }

  async softDelete(user: User): Promise<void> {
    await this.usersService.remove(user.id);
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    email: string;
    tenantId: string;
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          email: data.email,
          tenantId: data.tenantId,
        } as JwtPayloadType,
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          email: data.email,
          tenantId: data.tenantId,
        } as JwtPayloadType,
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
}
