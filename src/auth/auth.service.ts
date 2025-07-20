import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { User, UserDocument } from 'src/user/user.schema';
import { Util } from 'src/utils';
import { CreateUserDto, GenerateTokenDto, LoginUserDto } from './dto';
import { validateRefreshTokenDto } from './dto/validate-refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailService: MailService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const hashedPassword = await Util.hash(dto.password);
    const verifyToken = Util.generateToken();
    const verifyTokenExp = new Date(Date.now() + 1000 * 60 * 15);
    if (dto.password !== dto.confirm_password) {
      throw new BadRequestException('Password not matched!');
    }
    const result = await this.userModel.create({
      ...dto,
      password: hashedPassword,
      verifyToken,
      verifyTokenExp,
    });

    if (!result) {
      throw new BadRequestException(
        'Something went wrong while creating user!',
      );
    }
    await this.mailService.sendWelcomeEmail({
      name: dto.name,
      to: dto.email,
      url: this.config.get('CLIENT_URL') as string,
      year: new Date().getFullYear(),
    });
    await this.mailService.verifyEmail({
      name: dto.name,
      to: dto.email,
      url: this.config.get('CLIENT_URL') as string,
      year: new Date().getFullYear(),
    });

    return { success: true, message: 'Registration successful' };
  }

  async login(dto: LoginUserDto) {
    const result = await this.userModel.findOne({
      email: dto.email,
    });
    if (!result) {
      throw new NotFoundException('User not registered!');
    }
    const isCredMatched = await Util.match(result.password, dto.password);

    if (!isCredMatched) {
      throw new BadRequestException('Email or Password not matched');
    }
    const tokens = await this.generateTokens({
      id: result._id,
      email: result.email,
    });

    return {
      success: true,
      message: 'Login Successful 👌',
      data: {
        ...tokens,
      },
    };
  }

  async validateRefreshToken(dto: validateRefreshTokenDto) {
    const user = await this.userModel.findById(dto.id);
    if (!user || !user.refreshToken) {
      throw new NotFoundException('User not found!');
    }
    const isMatched = await Util.match(user.refreshToken, dto.refreshToken);
    if (!isMatched) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const tokens = await this.generateTokens({
      id: user._id,
      email: user.email,
    });
    await this.userModel.updateOne(
      {
        _id: user._id,
      },
      {
        refreshToken: tokens.refresh_token,
      },
    );
    return {
      success: true,
      message: 'New Token Revoked 🔑 ',
      data: {
        ...tokens,
      },
    };
  }

  async generateTokens(dto: GenerateTokenDto) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.sign(
        { sub: dto.id, email: dto.email },
        {
          secret: this.config.get('JWT_ACCESS_TOKEN') as string,
          expiresIn: this.config.get('JWT_ACCESS_EXPIRES') as string,
        },
      ),
      this.jwtService.sign(
        { sub: dto.id, email: dto.email },
        {
          secret: this.config.get('JWT_REFRESH_TOKEN') as string,
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES') as string,
        },
      ),
    ]);
    return { access_token, refresh_token };
  }
}
