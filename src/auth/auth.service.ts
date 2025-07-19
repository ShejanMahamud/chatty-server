import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { User, UserDocument } from 'src/user/user.schema';
import { Util } from 'src/utils';
import { CreateUserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailService: MailService,
    private config: ConfigService,
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
  }
}
