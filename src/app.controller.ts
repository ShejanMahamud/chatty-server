import { Controller, Get } from '@nestjs/common';
@Controller()
export class AppController {
  constructor() {}

  @Get()
  start() {
    return {
      status: true,
      message: 'Server Running🏃‍♂️ ',
      uptime: process.uptime(),
    };
  }
}
