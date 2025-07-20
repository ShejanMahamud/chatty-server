import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { validateRefreshTokenDto } from './dto/validate-refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt-refresh'))
  refreshToken(@Body() dto: validateRefreshTokenDto) {
    return this.authService.validateRefreshToken(dto);
  }
}
